import React from 'react';
import Header from '../components/Header';
import AuthGuard from '../components/AuthGuard';
import ImageUploader from '../components/ImageUploader';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { generateImageBatch } from '../services/geminiService';
import { creditsNeededPerImage } from '../services/creditsService';
import { supabase } from '../lib/supabase';

type PreviewItem = { id: string; dataUrl: string; meta: any; selected: boolean };

const genders = ['Female','Male'] as const;
const ages = ['Young Adult (18-25)','Adult (25-40)','Teenager (13-17)','Child (3-7)'] as const;
const ethnicities = ['Asian','Black','Caucasian','Hispanic','Indian','Middle Eastern'] as const;
const backgrounds = ['Studio White','Studio Gray','Outdoor Urban','Outdoor Nature'] as const;
const poses = ['Standing','Walking','Seated','Half-body','Close-up'] as const;
const categories = ['Standing Pose','Action Pose','Detail Shot','Aesthetic Shot','Flat Lay','Hanger Shot'] as const;

const AdminShowcasePage: React.FC = () => {
  const { user } = useAuth();
  const [adminAllowed, setAdminAllowed] = React.useState<boolean>(false);
  const [productImage, setProductImage] = React.useState<File | null>(null);
  const [productImageUrl, setProductImageUrl] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState({
    genders: new Set<string>(['Female']),
    ages: new Set<string>(['Adult (25-40)']),
    ethnicities: new Set<string>(['Indian']),
    backgrounds: new Set<string>(['Studio White']),
    poses: new Set<string>(['Standing']),
    categories: new Set<string>(['Standing Pose']),
  });
  const [countPerCategory, setCountPerCategory] = React.useState<number>(1);
  const [previews, setPreviews] = React.useState<PreviewItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [targetTotal, setTargetTotal] = React.useState<number>(24);
  const [sampling, setSampling] = React.useState<'balanced' | 'random'>('balanced');
  const [ensureCoverage, setEnsureCoverage] = React.useState<boolean>(true);
  const [seed, setSeed] = React.useState<number>(42);
  const [randomizePerVarPose, setRandomizePerVarPose] = React.useState<boolean>(false);
  const [randomizePerVarBg, setRandomizePerVarBg] = React.useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = React.useState<boolean>(false);
  const [showHelp, setShowHelp] = React.useState<boolean>(false);

  React.useEffect(() => {
    const allow = (import.meta.env.VITE_ADMIN_EMAILS || '').toLowerCase();
    const emails = allow.split(',').map(s=>s.trim()).filter(Boolean);
    setAdminAllowed(!!user && (emails.length === 0 || emails.includes((user.email||'').toLowerCase())));
  }, [user]);

  const toggle = (group: keyof typeof selected, value: string) => {
    setSelected(prev => {
      const next = new Set(prev[group]);
      if (next.has(value)) next.delete(value); else next.add(value);
      return { ...prev, [group]: next } as any;
    });
  };

  const handleProductSelect = (file: File) => {
    setProductImage(file);
    if (productImageUrl) URL.revokeObjectURL(productImageUrl);
    setProductImageUrl(URL.createObjectURL(file));
  };

  // Utilities for sampling and seeding
  const seededRandom = (s: number) => { let x = Math.abs(s) % 2147483647; if (x === 0) x = 1; return () => (x = (x * 48271) % 2147483647) / 2147483647; };
  type Combo = { gender: string; age: string; ethnicity: string; background: string; pose: string; category: string };
  const buildCombos = (): Combo[] => {
    const out: Combo[] = [];
    selected.categories.forEach((category) => {
      selected.genders.forEach((gender) => {
        selected.ages.forEach((age) => {
          selected.ethnicities.forEach((ethnicity) => {
            selected.backgrounds.forEach((background) => {
              selected.poses.forEach((pose) => { out.push({ category, gender, age, ethnicity, background, pose }); });
            });
          });
        });
      });
    });
    return out;
  };
  const sampleCombos = (combos: Combo[]): Combo[] => {
    if (combos.length <= targetTotal) return combos;
    const rng = seededRandom(seed);
    if (sampling === 'random') {
      const arr = [...combos];
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      if (!ensureCoverage) return arr.slice(0, targetTotal);
      const picked: Combo[] = []; const used = new Set<string>();
      const dims: (keyof Combo)[] = ['gender','age','ethnicity','background','pose','category'];
      for (const d of dims) {
        const values = Array.from(new Set(combos.map(c => (c as any)[d])));
        for (const v of values) {
          const c = arr.find(x => (x as any)[d] === v && !used.has(JSON.stringify(x)));
          if (c) { picked.push(c); used.add(JSON.stringify(c)); if (picked.length >= targetTotal) return picked; }
        }
      }
      for (const c of arr) { if (picked.length >= targetTotal) break; if (!used.has(JSON.stringify(c))) { picked.push(c); used.add(JSON.stringify(c)); } }
      return picked;
    }
    // balanced
    const picked: Combo[] = [];
    const usedCount: Record<keyof Combo, Record<string, number>> = { gender:{}, age:{}, ethnicity:{}, background:{}, pose:{}, category:{} } as any;
    const mark = (c: Combo) => { (Object.keys(usedCount) as (keyof Combo)[]).forEach(k => { const v = (c as any)[k]; usedCount[k][v] = (usedCount[k][v] || 0) + 1; }); };
    const score = (c: Combo) => (Object.keys(usedCount) as (keyof Combo)[]).map(k => usedCount[k][(c as any)[k]] || 0).reduce((a,b)=>a+b,0);
    const pool = [...combos]; const key = (c: Combo) => JSON.stringify(c); const used = new Set<string>(); const rng2 = rng;
    if (ensureCoverage) {
      (['gender','age','ethnicity','background','pose','category'] as (keyof Combo)[]).forEach(dim => {
        const vals = Array.from(new Set(combos.map(c => (c as any)[dim])));
        vals.forEach(v => { const elig = pool.filter(c => (c as any)[dim] === v && !used.has(key(c))); if (elig.length) { const c = elig[Math.floor(rng2()*elig.length)]; picked.push(c); used.add(key(c)); mark(c); } });
      });
    }
    while (picked.length < targetTotal && used.size < pool.length) {
      let best: Combo | null = null; let bestScore = Infinity;
      for (const c of pool) { if (used.has(key(c))) continue; const s = score(c) + rng2(); if (s < bestScore) { best = c; bestScore = s; } }
      if (!best) break; picked.push(best); used.add(key(best)); mark(best);
    }
    return picked.slice(0, targetTotal);
  };

  const generate = async () => {
    if (!productImage) { setError('Upload a product image first.'); return; }
    setError(null); setLoading(true); setPreviews([]);
    try {
      const combos = buildCombos();
      const sampled = sampleCombos(combos);
      const results: PreviewItem[] = [];
      const rng = seededRandom(seed + 1337);
      for (const combo of sampled) {
        for (let i = 0; i < countPerCategory; i++) {
          const opt: any = { gender: combo.gender, age: combo.age, ethnicity: combo.ethnicity, background: combo.background, imagesCount: 1, pose: combo.pose };
          if (randomizePerVarPose) opt.pose = Array.from(selected.poses)[Math.floor(rng() * selected.poses.size)] || combo.pose;
          if (randomizePerVarBg) opt.background = Array.from(selected.backgrounds)[Math.floor(rng() * selected.backgrounds.size)] || combo.background;
          const batch = await generateImageBatch(productImage, opt, 1);
          for (const r of batch) {
            results.push({ id: `${combo.category}-${Date.now()}-${Math.random()}`, dataUrl: r.src, meta: { ...combo, background: opt.background, pose: opt.pose, category: r.category }, selected: true });
          }
        }
      }
      setPreviews(results);
    } catch (e:any) {
      setError(e?.message || 'Generation failed');
    } finally { setLoading(false); }
  };

  const publish = async () => {
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')) as string;
      const sel = previews.filter(p => p.selected);
      // convert product input file to dataUrl once
      let input_public_url: string | null = null;
      let input_storage_path: string | null = null;
      const dataUrlToBlob = (du: string): Blob => {
        const arr = du.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length; const u8 = new Uint8Array(n);
        while (n--) u8[n] = bstr.charCodeAt(n);
        return new Blob([u8], { type: mime });
      };
      const userId = (await supabase.auth.getUser()).data.user?.id || 'anon';
      if (productImage) {
        // Read + downscale + upload input to Storage
        let inputDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(productImage as File);
        });
        inputDataUrl = await downscaleDataUrl(inputDataUrl, 1600, 0.9, 'image/jpeg').catch(()=>inputDataUrl!);
        const inBlob = dataUrlToBlob(inputDataUrl);
        const inPath = `${userId}/in-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error: inErr } = await supabase.storage.from('showcase').upload(inPath, inBlob, { upsert: true, contentType: inBlob.type || 'image/jpeg', cacheControl: '3600' });
        if (inErr) throw inErr;
        const { data: inUrlData } = supabase.storage.from('showcase').getPublicUrl(inPath);
        input_public_url = inUrlData.publicUrl;
        input_storage_path = inPath;
      }
      for (const p of sel) {
        // downscale output then upload directly to Supabase Storage
        const outDataUrl = await downscaleDataUrl(p.dataUrl, 1600, 0.92, 'image/jpeg').catch(()=>p.dataUrl);
        const outBlob = dataUrlToBlob(outDataUrl);
        const path = `${userId}/out-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error: upErr } = await supabase.storage.from('showcase').upload(path, outBlob, { upsert: true, contentType: outBlob.type || 'image/jpeg', cacheControl: '3600' });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('showcase').getPublicUrl(path);
        const public_url = urlData.publicUrl;
        const storage_path = path;

        const token = (await supabase.auth.getSession()).data.session?.access_token || '';
        const resp = await fetch(`${apiBase}/api/showcase/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ public_url, storage_path, input_public_url: input_public_url, input_storage_path: input_storage_path, ...p.meta }),
        });
        if (!resp.ok) {
          const t = await resp.text();
          throw new Error(`Upload failed: ${t}`);
        }
      }
      alert('Published to Showcase');
      setPreviews([]);
    } catch {}
  };

  // Downscale a data URL to reduce size (avoids 413 payload too large)
  async function downscaleDataUrl(
    dataUrl: string,
    maxSize = 1600,
    quality = 0.9,
    type: 'image/jpeg' | 'image/png' = 'image/jpeg'
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, maxSize / Math.max(width, height));
        const w = Math.max(1, Math.round(width * scale));
        const h = Math.max(1, Math.round(height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(dataUrl); return; }
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const out = canvas.toDataURL(type, quality);
          resolve(out);
        } catch { resolve(dataUrl); }
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  if (!adminAllowed) {
    return (
      <AuthGuard>
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 min-h-screen">
          <Header />
          <main className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-semibold">Showcase Admin</h1>
            <p className="text-sm text-gray-400 mt-2">You must be an admin to access this page.</p>
          </main>
        </div>
      </AuthGuard>
    );
  }

  // Totals: combinations and total images
  const totalCombos = selected.categories.size
    * selected.genders.size
    * selected.ages.size
    * selected.ethnicities.size
    * selected.backgrounds.size
    * selected.poses.size;
  const totalImages = totalCombos * countPerCategory;
  const sampledCombos = Math.min(totalCombos, targetTotal);
  const sampledImages = sampledCombos * countPerCategory;
  const creditEstimate = sampledImages * creditsNeededPerImage();

  return (
    <AuthGuard>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-semibold mb-4">Showcase Admin</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Image</label>
                <ImageUploader onImageSelect={handleProductSelect} selectedImageUrl={productImageUrl} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Genders</label>
                <div className="flex flex-wrap gap-2">
                  {genders.map(g => (
                    <button key={g} onClick={()=>toggle('genders', g)} className={`px-3 py-1 rounded border ${selected.genders.has(g) ? 'bg-blue-600 border-blue-500' : 'bg-gray-800/60 border-gray-700/50'}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ages</label>
                <div className="flex flex-wrap gap-2">
                  {ages.map(a => (
                    <button key={a} onClick={()=>toggle('ages', a)} className={`px-3 py-1 rounded border ${selected.ages.has(a) ? 'bg-blue-600 border-blue-500' : 'bg-gray-800/60 border-gray-700/50'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ethnicities</label>
                <div className="flex flex-wrap gap-2">
                  {ethnicities.map(a => (
                    <button key={a} onClick={()=>toggle('ethnicities', a)} className={`px-3 py-1 rounded border ${selected.ethnicities.has(a) ? 'bg-blue-600 border-blue-500' : 'bg-gray-800/60 border-gray-700/50'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Backgrounds</label>
                <div className="flex flex-wrap gap-2">
                  {backgrounds.map(a => (
                    <button key={a} onClick={()=>toggle('backgrounds', a)} className={`px-3 py-1 rounded border ${selected.backgrounds.has(a) ? 'bg-blue-600 border-blue-500' : 'bg-gray-800/60 border-gray-700/50'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Poses</label>
                <div className="flex flex-wrap gap-2">
                  {poses.map(a => (
                    <button key={a} onClick={()=>toggle('poses', a)} className={`px-3 py-1 rounded border ${selected.poses.has(a) ? 'bg-blue-600 border-blue-500' : 'bg-gray-800/60 border-gray-700/50'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Shot Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(a => (
                    <button key={a} onClick={()=>toggle('categories', a)} className={`px-3 py-1 rounded border ${selected.categories.has(a) ? 'bg-blue-600 border-blue-500' : 'bg-gray-800/60 border-gray-700/50'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Variations per selected combo</label>
                <input type="number" min={1} max={3} value={countPerCategory} onChange={e=>setCountPerCategory(Math.max(1, Math.min(3, Number(e.target.value))))} className="w-24 bg-gray-800/60 border border-gray-700/50 rounded px-2 py-1 text-gray-200" />
                <p className="text-[11px] text-gray-500 mt-1">Each sampled combo generates this many variations.</p>
              </div>
              <div className="p-3 rounded-md bg-gray-900/60 border border-gray-700/50">
                <div className="text-sm text-gray-300 font-medium mb-1">Summary</div>
                <div className="text-xs text-gray-400">
                  Selected <span className="text-gray-200 font-semibold">{totalCombos}</span> combos · Target <span className="text-gray-200 font-semibold">{targetTotal}</span> images
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Final: <span className="text-white font-semibold">{sampledImages}</span> images ({sampledCombos} combos × {countPerCategory} variations) · Est. credits <span className="text-white font-semibold">{creditEstimate}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sampling</label>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-gray-400">Mode</span>
                  <select value={sampling} onChange={e=>setSampling(e.target.value as any)} className="bg-gray-800/60 border border-gray-700/50 rounded px-2 py-1 text-gray-200">
                    <option value="balanced">Balanced</option>
                    <option value="random">Random</option>
                  </select>
                  <span className="text-xs text-gray-400">Target total images</span>
                  <input type="number" min={1} max={200} value={targetTotal} onChange={e=>setTargetTotal(Math.max(1, Math.min(200, Number(e.target.value))))} className="w-20 bg-gray-800/60 border border-gray-700/50 rounded px-2 py-1 text-gray-200" />
                  <button type="button" onClick={()=>setShowAdvanced(v=>!v)} className="ml-auto text-xs text-blue-400 hover:text-blue-300">{showAdvanced?'Hide advanced':'Show advanced'}</button>
                  <button type="button" onClick={()=>setShowHelp(v=>!v)} className="text-xs text-gray-400 hover:text-gray-300">{showHelp?'Hide help':'What does this mean?'}</button>
                </div>
                {showHelp && (
                  <div className="mt-2 text-[11px] text-gray-400 space-y-1 bg-gray-900/50 border border-gray-700/50 rounded p-2">
                    <div><span className="text-gray-300 font-medium">Balanced:</span> spreads picks evenly over your selections. Example: if you choose 2 genders × 3 ethnicities and set Target 12 images, you’ll get roughly 6 Female/6 Male and ~4 per ethnicity (not exact, but even).</div>
                    <div><span className="text-gray-300 font-medium">Random:</span> purely random sample. Example: with the same Target 12, you might end up with 9 Female / 3 Male or uneven ethnicities. Faster, but less controlled.</div>
                    <div><span className="text-gray-300 font-medium">Target total images:</span> the cap. We sample down to this number before generating.</div>
                    <div><span className="text-gray-300 font-medium">Seed:</span> makes the sample reproducible. Same seed + same selections → same sampled set.</div>
                    <div><span className="text-gray-300 font-medium">Ensure coverage:</span> guarantees at least one image for every selected Gender/Age/Ethnicity/Background/Pose/Category (when possible).</div>
                  </div>
                )}
                {showAdvanced && (
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2 text-xs text-gray-300">
                      <input type="checkbox" checked={ensureCoverage} onChange={e=>setEnsureCoverage(e.target.checked)} /> Ensure each selected value appears at least once
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Seed</span>
                      <input type="number" value={seed} onChange={e=>setSeed(Number(e.target.value)||0)} className="w-20 bg-gray-800/60 border border-gray-700/50 rounded px-2 py-1 text-gray-200" />
                    </div>
                  </div>
                )}
              </div>
              {showAdvanced && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Extra variation</label>
                  <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={randomizePerVarPose} onChange={e=>setRandomizePerVarPose(e.target.checked)} /> Randomize pose per variation</label>
                  <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={randomizePerVarBg} onChange={e=>setRandomizePerVarBg(e.target.checked)} /> Randomize background per variation</label>
                  <p className="text-[11px] text-gray-500 mt-1">Keeps the selected set but randomizes pose/background across variations to add diversity.</p>
                </div>
              )}
              {error && <div className="text-sm text-red-400">{error}</div>}
              <div className="flex gap-2">
                <Button onClick={generate} isLoading={loading}>Generate Preview</Button>
                <Button variant="secondary" onClick={publish} disabled={previews.filter(p=>p.selected).length===0 || loading}>Publish Selected</Button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold mb-3">Previews</h2>
              {previews.length === 0 ? (
                <div className="text-sm text-gray-400">No previews yet.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previews.map(p => (
                    <div key={p.id} className={`rounded border ${p.selected ? 'border-blue-500' : 'border-gray-700'} overflow-hidden`}>
                      <img src={p.dataUrl} alt="preview" className="w-full h-auto block" />
                      <div className="p-2 text-[11px] text-gray-400 flex items-center justify-between">
                        <span>{p.meta.gender} • {p.meta.age}</span>
                        <label className="flex items-center gap-1">
                          <input type="checkbox" checked={p.selected} onChange={() => setPreviews(prev => prev.map(x => x.id===p.id ? { ...x, selected: !x.selected } : x))} /> Select
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default AdminShowcasePage;



import React from 'react';
import Header from '../components/Header';
import AuthGuard from '../components/AuthGuard';
import ImageUploader from '../components/ImageUploader';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { generateImageBatch } from '../services/geminiService';

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

  const generate = async () => {
    if (!productImage) { setError('Upload a product image first.'); return; }
    setError(null); setLoading(true); setPreviews([]);
    try {
      const combos: any[] = [];
      selected.categories.forEach((category) => {
        selected.genders.forEach((gender) => {
          selected.ages.forEach((age) => {
            selected.ethnicities.forEach((ethnicity) => {
              selected.backgrounds.forEach((background) => {
                selected.poses.forEach((pose) => {
                  combos.push({ category, gender, age, ethnicity, background, pose });
                });
              });
            });
          });
        });
      });
      const results: PreviewItem[] = [];
      for (const combo of combos) {
        const options = { gender: combo.gender, age: combo.age, ethnicity: combo.ethnicity, background: combo.background, imagesCount: countPerCategory, pose: combo.pose } as any;
        const batch = await generateImageBatch(productImage, options, countPerCategory);
        for (const r of batch) {
          results.push({ id: `${combo.category}-${Date.now()}-${Math.random()}`, dataUrl: r.src, meta: { ...combo, category: r.category }, selected: true });
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
      for (const p of sel) {
        await fetch(`${apiBase}/api/showcase/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(await (await import('../lib/supabase')).supabase.auth.getSession()).data.session?.access_token || ''}` },
          body: JSON.stringify({ dataUrl: p.dataUrl, ...p.meta }),
        });
      }
      alert('Published to Showcase');
      setPreviews([]);
    } catch {}
  };

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
                <label className="block text-sm font-medium text-gray-300 mb-2">Images per category</label>
                <input type="number" min={1} max={3} value={countPerCategory} onChange={e=>setCountPerCategory(Math.max(1, Math.min(3, Number(e.target.value))))} className="w-24 bg-gray-800/60 border border-gray-700/50 rounded px-2 py-1 text-gray-200" />
              </div>
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



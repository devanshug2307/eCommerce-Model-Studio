import React from 'react';
import ShowcaseItemModal from '../components/ShowcaseItemModal';
import Header from '../components/Header';

type ShowcaseItem = {
  id: string;
  title?: string;
  public_url: string;
  storage_path: string;
  input_public_url?: string | null;
  gender?: 'Male' | 'Female';
  age?: string;
  ethnicity?: string;
  background?: string;
  pose?: string;
  category?: string;
  created_at?: string;
};

const ShowcasePage: React.FC = () => {
  const [items, setItems] = React.useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [selected, setSelected] = React.useState<ShowcaseItem | null>(null);
  const [q, setQ] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [age, setAge] = React.useState('');
  const [ethnicity, setEthnicity] = React.useState('');
  const [background, setBackground] = React.useState('');
  const [pose, setPose] = React.useState('');
  const [sort, setSort] = React.useState<'new' | 'old'>('new');

  const fetchList = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (gender) params.set('gender', gender);
    if (age) params.set('age', age);
    if (ethnicity) params.set('ethnicity', ethnicity);
    if (background) params.set('background', background);
    if (pose) params.set('pose', pose);
    if (sort) params.set('sort', sort);
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')) as string;
      const resp = await fetch(`${apiBase}/api/showcase/list?${params.toString()}`);
      const data = await resp.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setItems([]);
    } finally { setLoading(false); }
  }, [q, gender, age, ethnicity, background, pose, sort]);

  React.useEffect(() => { fetchList(); }, [fetchList]);

  const useThisModel = (it: ShowcaseItem) => {
    const params = new URLSearchParams();
    if (it.gender) params.set('gender', it.gender);
    if (it.age) params.set('age', it.age);
    if (it.ethnicity) params.set('ethnicity', it.ethnicity);
    if (it.background) params.set('background', it.background);
    if (it.pose) params.set('pose', it.pose);
    window.history.pushState({}, '', `/studio?${params.toString()}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const unique = (arr: (string|undefined)[]) => Array.from(new Set(arr.filter(Boolean) as string[]));
  const genders = unique(items.map(i => i.gender));
  const ages = unique(items.map(i => i.age));
  const ethnics = unique(items.map(i => i.ethnicity));
  const backgrounds = unique(items.map(i => i.background));
  const poses = unique(items.map(i => i.pose));

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Showcase</h1>
            <p className="text-xs text-gray-500 mt-1">Explore curated models. Click any to use in Studio.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 sm:gap-3 w-full sm:w-auto">
            <input className="col-span-2 bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500" placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} />
            <select className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200" value={gender} onChange={e=>setGender(e.target.value)}>
              <option value="">Any Gender</option>
              {genders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200" value={age} onChange={e=>setAge(e.target.value)}>
              <option value="">Any Age</option>
              {ages.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200" value={ethnicity} onChange={e=>setEthnicity(e.target.value)}>
              <option value="">Any Ethnicity</option>
              {ethnics.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200" value={background} onChange={e=>setBackground(e.target.value)}>
              <option value="">Any Background</option>
              {backgrounds.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200" value={pose} onChange={e=>setPose(e.target.value)}>
              <option value="">Any Pose</option>
              {poses.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200" value={sort} onChange={e=>setSort(e.target.value as any)}>
              <option value="new">Newest</option>
              <option value="old">Oldest</option>
            </select>
            <button onClick={fetchList} className="bg-gray-800/60 hover:bg-gray-700 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200">Apply</button>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-400">No items yet.</div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {items.map((it) => (
              <div key={it.id || it.storage_path} className="mb-4 break-inside-avoid bg-gray-800 rounded-lg border border-gray-700 shadow hover:shadow-lg transition-shadow">
                <div className="relative overflow-hidden rounded-t-lg cursor-pointer" onClick={() => setSelected(it)}>
                  <img src={it.public_url} alt={it.title || 'Showcase'} loading="lazy" className="w-full h-auto block" />
                  {it.input_public_url && (
                    <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded bg-black/60 border border-white/10 text-white">Compare</div>
                  )}
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-2">
                    <div className="flex gap-2 text-[10px]">
                      {it.gender && <span className="px-2 py-1 rounded bg-gray-800/80">{it.gender}</span>}
                      {it.age && <span className="px-2 py-1 rounded bg-gray-800/80">{it.age}</span>}
                      {it.ethnicity && <span className="px-2 py-1 rounded bg-gray-800/80">{it.ethnicity}</span>}
                    </div>
                    <button className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-xs rounded" onClick={(e) => { e.stopPropagation(); useThisModel(it); }}>Use this model</button>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-400 flex items-center justify-between">
                  <div className="truncate max-w-[70%]">{it.title || it.category || 'Model'}</div>
                  <button className="text-blue-400 hover:text-blue-300" onClick={() => useThisModel(it)}>Use</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {selected && <ShowcaseItemModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default ShowcasePage;



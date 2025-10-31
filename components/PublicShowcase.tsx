import React from 'react';
import ShowcaseItemModal from './ShowcaseItemModal';

type ShowcaseItem = {
  id: string;
  title?: string;
  public_url: string;
  input_public_url?: string | null;
  gender?: 'Male' | 'Female';
  age?: string;
  ethnicity?: string;
  background?: string;
  pose?: string;
  category?: string;
};

const PublicShowcase: React.FC = () => {
  const [items, setItems] = React.useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [selected, setSelected] = React.useState<ShowcaseItem | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')) as string;
        const resp = await fetch(`${apiBase}/api/showcase/list?limit=12`);
        const data = await resp.json();
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch {
        setItems([]);
      } finally { setLoading(false); }
    })();
  }, []);

  const viewAll = () => {
    window.history.pushState({}, '', '/showcase');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

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

  if (loading || items.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Explore Models</h2>
        <button className="text-blue-400 hover:text-blue-300" onClick={viewAll}>View all</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(it => (
          <div key={it.id} className="group bg-gray-800/60 border border-gray-700/50 rounded-lg overflow-hidden">
            <div className="relative cursor-pointer" onClick={() => setSelected(it)}>
              <img src={it.public_url} alt={it.title || 'Model'} className="w-full h-auto block" loading="lazy" />
              {it.input_public_url && (
                <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded bg-black/60 border border-white/10 text-white">Compare</div>
              )}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-2">
                <div className="text-[10px] flex gap-1">
                  {it.gender && <span className="px-1.5 py-0.5 rounded bg-gray-800/80">{it.gender}</span>}
                  {it.age && <span className="px-1.5 py-0.5 rounded bg-gray-800/80">{it.age}</span>}
                </div>
                <button className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-xs rounded" onClick={(e) => { e.stopPropagation(); useThisModel(it); }}>Use</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selected && <ShowcaseItemModal item={selected} onClose={() => setSelected(null)} />}
    </section>
  );
};

export default PublicShowcase;



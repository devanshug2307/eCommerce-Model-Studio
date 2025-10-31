import React from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';

type ShowcaseItem = {
  id: string;
  title?: string;
  public_url: string;
  storage_path: string;
  input_public_url?: string | null;
  input_storage_path?: string | null;
  gender?: 'Male' | 'Female';
  age?: string;
  ethnicity?: string;
  background?: string;
  pose?: string;
  category?: string;
};

type Props = {
  item: ShowcaseItem;
  onClose: () => void;
};

const ShowcaseItemModal: React.FC<Props> = ({ item, onClose }) => {
  const [active, setActive] = React.useState<ShowcaseItem>(item);
  const [related, setRelated] = React.useState<ShowcaseItem[]>([]);
  const [loadingRelated, setLoadingRelated] = React.useState(false);

  React.useEffect(() => { setActive(item); }, [item]);

  React.useEffect(() => {
    if (!item.input_storage_path) return;
    setLoadingRelated(true);
    (async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')) as string;
        const resp = await fetch(`${apiBase}/api/showcase/list?input_storage_path=${encodeURIComponent(item.input_storage_path)}&limit=36`);
        const data = await resp.json();
        const items = Array.isArray(data.items) ? data.items : [];
        // Put current first, rest unique by id
        const filtered = items.filter((x: ShowcaseItem) => x.id !== item.id);
        setRelated(filtered);
      } catch {
        setRelated([]);
      } finally { setLoadingRelated(false); }
    })();
  }, [item.input_storage_path, item.id]);

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

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="text-sm text-gray-300 truncate">{active.title || active.category || 'Model'}</div>
            <button className="text-gray-400 hover:text-gray-200" onClick={onClose}>Close</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            <div className="lg:col-span-2 bg-black aspect-square relative">
              {active.input_public_url ? (
                <BeforeAfterSlider beforeImage={active.input_public_url} afterImage={active.public_url} />
              ) : (
                <img src={active.public_url} alt={active.title || 'Model'} className="w-full h-full object-contain" />
              )}
              <div className="absolute top-3 left-3 flex gap-2 text-[10px]">
                {active.gender && <span className="px-2 py-1 rounded bg-gray-800/80 text-gray-100 border border-gray-700/60">{active.gender}</span>}
                {active.age && <span className="px-2 py-1 rounded bg-gray-800/80 text-gray-100 border border-gray-700/60">{active.age}</span>}
                {active.ethnicity && <span className="px-2 py-1 rounded bg-gray-800/80 text-gray-100 border border-gray-700/60">{active.ethnicity}</span>}
              </div>
            </div>

            <div className="lg:col-span-1 p-4 space-y-4">
              <div>
                <div className="text-sm text-gray-300 mb-2">Details</div>
                <div className="flex flex-wrap gap-2 text-[11px] text-gray-300">
                  {active.background && <span className="px-2 py-1 rounded bg-gray-800/60 border border-gray-700/50">{active.background}</span>}
                  {active.pose && <span className="px-2 py-1 rounded bg-gray-800/60 border border-gray-700/50">{active.pose}</span>}
                  {active.category && <span className="px-2 py-1 rounded bg-gray-800/60 border border-gray-700/50">{active.category}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm" onClick={() => useThisModel(active)}>Use this model</button>
                <a className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm border border-gray-700" href={active.public_url} target="_blank" rel="noreferrer">Open image</a>
              </div>

              <div>
                <div className="text-sm text-gray-300 mb-2">More from this input</div>
                {loadingRelated ? (
                  <div className="text-xs text-gray-500">Loading...</div>
                ) : related.length === 0 ? (
                  <div className="text-xs text-gray-500">No other outputs.</div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {related.map(r => (
                      <button key={r.id} className={`relative border ${r.id===active.id?'border-blue-500':'border-gray-700'} rounded overflow-hidden`} onClick={()=>setActive(r)}>
                        <img src={r.public_url} alt={r.title || 'Related'} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseItemModal;



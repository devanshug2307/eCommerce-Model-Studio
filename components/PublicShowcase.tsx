import React from 'react';

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

  const [openBA, setOpenBA] = React.useState<ShowcaseItem | null>(null);

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Explore Models</h2>
        <button className="text-blue-400 hover:text-blue-300" onClick={viewAll}>View all</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(it => (
          <div key={it.id} className="group bg-gray-800/60 border border-gray-700/50 rounded-lg overflow-hidden">
            <div className="relative cursor-pointer" onClick={() => useThisModel(it)}>
              <img src={it.public_url} alt={it.title || 'Model'} className="w-full h-auto block" loading="lazy" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-2">
                <div className="text-[10px] flex gap-1">
                  {it.gender && <span className="px-1.5 py-0.5 rounded bg-gray-800/80">{it.gender}</span>}
                  {it.age && <span className="px-1.5 py-0.5 rounded bg-gray-800/80">{it.age}</span>}
                </div>
                <div className="flex gap-2">
                  {it.input_public_url && (
                    <button className="px-2 py-1 bg-gray-800/80 hover:bg-gray-700 text-xs rounded" onClick={(e) => { e.stopPropagation(); setOpenBA(it); }}>Before/After</button>
                  )}
                  <button className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-xs rounded" onClick={(e) => { e.stopPropagation(); useThisModel(it); }}>Use</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {openBA && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/70" onClick={()=>setOpenBA(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-3xl w-full p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-300">Before / After</div>
                <button className="text-gray-400 hover:text-gray-200" onClick={()=>setOpenBA(null)}>Close</button>
              </div>
              {openBA.input_public_url ? (
                <div className="rounded overflow-hidden">
                  <iframe title="before-after" style={{width:'100%', height:'55vh', border:'0'}} srcDoc={`<!DOCTYPE html><html><head><meta charset='utf-8'/><meta name='viewport' content='width=device-width,initial-scale=1'/><style>body{margin:0;background:#0b0b0b}</style></head><body><div id='root'></div><script>const root=document.getElementById('root');const wrap=document.createElement('div');wrap.style.position='relative';wrap.style.maxWidth='100%';wrap.style.height='55vh';wrap.style.overflow='hidden';const before=document.createElement('img');before.src='${openBA.input_public_url}';before.style.width='100%';before.style.height='100%';before.style.objectFit='contain';const after=document.createElement('img');after.src='${openBA.public_url}';after.style.width='100%';after.style.height='100%';after.style.objectFit='contain';after.style.position='absolute';after.style.top='0';after.style.left='0';const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='100';slider.value='50';slider.style.position='absolute';slider.style.bottom='8px';slider.style.left='8px';slider.style.right='8px';slider.style.width='calc(100% - 16px)';slider.oninput=()=>{after.style.clipPath='inset(0 '+(100-slider.value)+'% 0 0)'};after.style.clipPath='inset(0 50% 0 0)';wrap.appendChild(before);wrap.appendChild(after);wrap.appendChild(slider);root.appendChild(wrap);</script></body></html>`} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PublicShowcase;



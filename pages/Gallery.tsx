import React from 'react';
import { listGallery, GalleryImage, uploadToGallery } from '../services/galleryService';
import AuthGuard from '../components/AuthGuard';
import ImageEditorModal from '../components/ImageEditorModal';

const GalleryPage: React.FC = () => {
  const [images, setImages] = React.useState<GalleryImage[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [rotations, setRotations] = React.useState<Record<string, number>>({});
  const [openMeta, setOpenMeta] = React.useState<Record<string, boolean>>({});
  const [filterCategory, setFilterCategory] = React.useState<string>('');
  const [filterBackground, setFilterBackground] = React.useState<string>('');
  const [searchText, setSearchText] = React.useState<string>('');
  const [sortOrder, setSortOrder] = React.useState<'new' | 'old'>('new');
  const [dateFrom, setDateFrom] = React.useState<string>('');
  const [dateTo, setDateTo] = React.useState<string>('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingSrc, setEditingSrc] = React.useState<string | null>(null);
  const [selectMode, setSelectMode] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const items = await listGallery();
      if (mounted) setImages(items);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const rotate = (id: string) => {
    setRotations((prev) => ({ ...prev, [id]: ((prev[id] || 0) + 90) % 360 }));
  };

  const categories = React.useMemo(() => Array.from(new Set(images.map(i => i.category).filter(Boolean))) as string[], [images]);
  const backgrounds = React.useMemo(() => Array.from(new Set(images.map(i => i.background).filter(Boolean))) as string[], [images]);

  const filtered = React.useMemo(() => {
    let arr = images.slice();
    if (filterCategory) arr = arr.filter(i => (i.category || '') === filterCategory);
    if (filterBackground) arr = arr.filter(i => (i.background || '') === filterBackground);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      arr = arr.filter(i => (i.category || '').toLowerCase().includes(q) || (i.background || '').toLowerCase().includes(q));
    }
    if (dateFrom) arr = arr.filter(i => new Date(i.created_at).getTime() >= new Date(dateFrom).getTime());
    if (dateTo) arr = arr.filter(i => new Date(i.created_at).getTime() <= new Date(dateTo).getTime());
    arr.sort((a,b) => sortOrder === 'new' ? (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
    return arr;
  }, [images, filterCategory, filterBackground, searchText, sortOrder, dateFrom, dateTo]);

  const openEditor = (img: GalleryImage) => {
    setEditingId(img.id);
    setEditingSrc(img.public_url);
  };

  const applyEditedAsNew = async (dataUrl: string) => {
    try {
      const srcId = editingId;
      const src = images.find(i => i.id === srcId);
      await uploadToGallery(dataUrl, {
        background: src?.background,
        category: 'Edited Version',
        gender: src?.gender,
        age: src?.age,
        ethnicity: src?.ethnicity,
      });
      // Refresh list
      const items = await listGallery();
      setImages(items);
    } catch {}
    setEditingId(null);
    setEditingSrc(null);
  };

  

  const toggleSelect = (id: string) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  const clearSelection = () => setSelected({});

  const downloadSelected = () => {
    const ids = Object.keys(selected).filter(id => selected[id]);
    ids.forEach(id => {
      const img = images.find(i => i.id === id);
      if (!img) return;
      const a = document.createElement('a');
      a.href = img.public_url;
      a.download = (img.category || 'image').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  // removed upscaler

  

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Your Gallery</h1>
            <p className="text-xs text-gray-500 mt-1">Edit, filter and download your generated images</p>
          </div>
          {!loading && images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="col-span-2 sm:col-span-2 bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
              />
              <select value={filterCategory} onChange={(e)=>setFilterCategory(e.target.value)} className="col-span-1 bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterBackground} onChange={(e)=>setFilterBackground(e.target.value)} className="col-span-1 bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200">
                <option value="">All Backgrounds</option>
                {backgrounds.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} className="col-span-1 bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200" />
              <input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} className="col-span-1 bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200" />
              <select value={sortOrder} onChange={(e)=>setSortOrder(e.target.value as any)} className="col-span-1 bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200">
                <option value="new">Newest</option>
                <option value="old">Oldest</option>
              </select>
              <button onClick={()=>{setFilterCategory(''); setFilterBackground(''); setSearchText(''); setDateFrom(''); setDateTo(''); setSortOrder('new');}} className="col-span-1 bg-gray-800/60 hover:bg-gray-700 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200">Reset</button>
              <button onClick={()=>setSelectMode(v=>!v)} className={`col-span-1 border rounded-lg px-2 py-2 text-sm ${selectMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800/60 hover:bg-gray-700 border-gray-700/50 text-gray-200'}`}>{selectMode ? 'Selecting…' : 'Select'}</button>
              <button onClick={downloadSelected} disabled={!Object.values(selected).some(Boolean)} className="col-span-1 bg-gray-800/60 hover:bg-gray-700 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200 disabled:opacity-50">Download selected</button>
              <button onClick={clearSelection} className="col-span-1 bg-gray-800/60 hover:bg-gray-700 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200">Clear</button>
            </div>
          )}
        </div>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : images.length === 0 ? (
          <div className="text-gray-400">No images yet. Generate some and they will appear here.</div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {filtered.map((img) => {
              const isSelected = !!selected[img.id];
              return (
              <div key={img.id} className={`mb-4 break-inside-avoid bg-gray-800 rounded-lg border transition-shadow ${isSelected ? 'border-blue-500 shadow shadow-blue-500/20' : 'border-gray-700 hover:shadow-lg'}`}>
                <div className="relative overflow-hidden rounded-t-lg" onClick={() => { if (selectMode) toggleSelect(img.id); }}>
                  {selectMode && (
                    <label className="absolute top-2 left-2 z-10 bg-black/50 rounded px-2 py-1 text-xs text-gray-200 flex items-center gap-1">
                      <input type="checkbox" checked={!!selected[img.id]} onChange={() => toggleSelect(img.id)} />
                      Select
                    </label>
                  )}
                  <img
                    src={img.public_url}
                    alt="Generated"
                    loading="lazy"
                    className="w-full h-auto block"
                    style={{ transform: `rotate(${rotations[img.id] || 0}deg)` }}
                  />
                  {selectMode && isSelected && (<div className="absolute inset-0 ring-4 ring-blue-500/50 pointer-events-none" />)}
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-2">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 bg-gray-800/80 hover:bg-gray-700 text-xs rounded" onClick={() => rotate(img.id)}>Rotate</button>
                      <button className="px-2 py-1 bg-gray-800/80 hover:bg-gray-700 text-xs rounded" onClick={() => openEditor(img)}>Edit</button>
                      {/* Upscaler and favorites removed */}
                    </div>
                    <a className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-xs rounded" href={img.public_url} download>Download</a>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-400 flex items-center justify-between">
                  <div className="truncate max-w-[70%]">
                    {img.category || 'Generated'}
                  </div>
                  <button
                    className="text-blue-400 hover:text-blue-300"
                    onClick={() => setOpenMeta(v => ({ ...v, [img.id]: !v[img.id] }))}
                  >
                    {openMeta[img.id] ? 'Hide' : 'Details'}
                  </button>
                </div>
                {openMeta[img.id] && (
                  <div className="px-3 pb-3 text-xs text-gray-300 space-y-1">
                    {img.category && <div><span className="text-gray-500">Category:</span> {img.category}</div>}
                    {img.gender && <div><span className="text-gray-500">Gender:</span> {img.gender}</div>}
                    {img.age && <div><span className="text-gray-500">Age:</span> {img.age}</div>}
                    {img.ethnicity && <div><span className="text-gray-500">Ethnicity:</span> {img.ethnicity}</div>}
                    {img.background && <div><span className="text-gray-500">Background:</span> {img.background}</div>}
                    <div className="text-gray-500 break-all">{img.storage_path}</div>
                  </div>
                )}
              </div>
            );})}
          </div>
        )}
      </div>
      <ImageEditorModal
        open={!!editingSrc}
        src={editingSrc}
        title={'Edit Image'}
        onClose={() => { setEditingId(null); setEditingSrc(null); }}
        onApplyNew={applyEditedAsNew}
        onReplace={() => { /* Not replacing originals from gallery */ }}
      />
    </AuthGuard>
  );
};

export default GalleryPage;



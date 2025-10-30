import React from 'react';
import { listGallery, GalleryImage } from '../services/galleryService';
import AuthGuard from '../components/AuthGuard';

const GalleryPage: React.FC = () => {
  const [images, setImages] = React.useState<GalleryImage[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [rotations, setRotations] = React.useState<Record<string, number>>({});

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

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Your Gallery</h1>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : images.length === 0 ? (
          <div className="text-gray-400">No images yet. Generate some and they will appear here.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
              <div key={img.id} className="bg-gray-800 rounded-lg p-3 shadow border border-gray-700">
                <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-900 flex items-center justify-center">
                  <img
                    src={img.public_url}
                    alt="Generated"
                    className="max-w-full max-h-full"
                    style={{ transform: `rotate(${rotations[img.id] || 0}deg)` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <button
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                    onClick={() => rotate(img.id)}
                  >Rotate</button>
                  <a
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm"
                    href={img.public_url}
                    download
                  >Download</a>
                </div>
                <div className="text-xs text-gray-500 mt-2 break-all">{img.storage_path}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default GalleryPage;



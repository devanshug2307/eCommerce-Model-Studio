import React from 'react';
import Button from './Button';
import ImageEditor from './ImageEditor';

interface ImageEditorModalProps {
  open: boolean;
  src: string | null;
  title?: string;
  onClose: () => void;
  onApplyNew: (dataUrl: string) => void;
  onReplace: (dataUrl: string) => void;
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ open, src, title = 'Edit Image', onClose, onApplyNew, onReplace }) => {
  const [lastDataUrl, setLastDataUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) setLastDataUrl(null);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex flex-col">
        <div className="mx-auto my-6 w-full max-w-6xl max-h-[85vh] rounded-lg border border-gray-700 bg-gray-900 shadow-xl overflow-hidden flex flex-col">
          <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="text-gray-200 font-semibold">{title}</div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="text-sm py-1" onClick={onClose}>Close</Button>
            </div>
          </header>
          <div className="grid grid-cols-12 gap-0 h-full">
            <div className="col-span-12 lg:col-span-9 p-4 overflow-auto">
              <ImageEditor src={src} onApply={(du) => setLastDataUrl(du)} />
            </div>
            <aside className="col-span-12 lg:col-span-3 border-t lg:border-t-0 lg:border-l border-gray-800 p-4 flex flex-col gap-2 overflow-auto">
              <p className="text-xs text-gray-400">Non-destructive editing. Apply as New to keep the original, or Replace it.</p>
              <Button
                onClick={() => { if (lastDataUrl) onApplyNew(lastDataUrl); }}
                disabled={!lastDataUrl}
                className="w-full"
              >
                Apply as New
              </Button>
              <Button
                variant="secondary"
                onClick={() => { if (lastDataUrl) onReplace(lastDataUrl); }}
                disabled={!lastDataUrl}
                className="w-full"
              >
                Replace Original
              </Button>
              <Button
                variant="secondary"
                onClick={onClose}
                className="w-full"
              >
                Cancel
              </Button>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorModal;



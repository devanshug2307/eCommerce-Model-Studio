import React from 'react';
import Button from './Button';

interface ImageEditorProps {
  src: string | null;
  disabled?: boolean;
  onApply: (dataUrl: string) => void;
}

// Simple non-AI editor using <canvas>: brightness/contrast/saturation, rotate, flip.
const ImageEditor: React.FC<ImageEditorProps> = ({ src, disabled, onApply }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  const [brightness, setBrightness] = React.useState<number>(0); // -100..100
  const [contrast, setContrast] = React.useState<number>(0); // -100..100 (we'll map to 0..2)
  const [saturation, setSaturation] = React.useState<number>(0); // -100..100 (map to 0..2)
  const [grayscale, setGrayscale] = React.useState<boolean>(false);
  const [rotate, setRotate] = React.useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = React.useState<boolean>(false);
  const [flipV, setFlipV] = React.useState<boolean>(false);

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Base dimensions
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    // For rotations that swap dimensions
    const angle = ((rotate % 360) + 360) % 360;
    const rad = (angle * Math.PI) / 180;
    const swap = angle === 90 || angle === 270;
    canvas.width = swap ? h : w;
    canvas.height = swap ? w : h;

    ctx.save();
    // Move to center and transform
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();

    // Post-process pixels for brightness/contrast/saturation/grayscale
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const b = brightness; // -100..100
    const c = contrast; // -100..100 -> factor
    const s = saturation; // -100..100

    // Compute factors
    const contrastFactor = (259 * (c + 255)) / (255 * (259 - c)); // classic contrast
    const satFactor = (s + 100) / 100; // 0..2
    const brightAdd = (b / 100) * 255; // -255..255

    for (let i = 0; i < data.length; i += 4) {
      // brightness + contrast
      let r = contrastFactor * (data[i] - 128) + 128 + brightAdd;
      let g = contrastFactor * (data[i + 1] - 128) + 128 + brightAdd;
      let bl = contrastFactor * (data[i + 2] - 128) + 128 + brightAdd;

      // saturation (convert to HSL-ish quick method via luminance)
      const lum = 0.299 * r + 0.587 * g + 0.114 * bl;
      r = lum + (r - lum) * satFactor;
      g = lum + (g - lum) * satFactor;
      bl = lum + (bl - lum) * satFactor;

      // grayscale
      if (grayscale) {
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
        r = g = bl = gray;
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, bl));
    }

    ctx.putImageData(imageData, 0, 0);
  }, [brightness, contrast, saturation, grayscale, rotate, flipH, flipV]);

  React.useEffect(() => {
    draw();
  }, [draw]);

  React.useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const onLoad = () => draw();
    img.addEventListener('load', onLoad);
    return () => img.removeEventListener('load', onLoad);
  }, [draw, src]);

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onApply(dataUrl);
  };

  return (
    <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-100 mb-2">Edit Image</h3>
      {!src && <p className="text-sm text-gray-400">Upload an image to edit.</p>}
      {src && (
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-md p-2 overflow-auto">
            <canvas ref={canvasRef} className="max-w-full h-auto max-h-[60vh]" />
            {/* hidden img used for drawing */}
            <img ref={imgRef} src={src} alt="editable" style={{ display: 'none' }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-gray-300 flex flex-col gap-1">
              Brightness
              <input type="range" min={-100} max={100} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} />
            </label>
            <label className="text-sm text-gray-300 flex flex-col gap-1">
              Contrast
              <input type="range" min={-100} max={100} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} />
            </label>
            <label className="text-sm text-gray-300 flex flex-col gap-1">
              Saturation
              <input type="range" min={-100} max={100} value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} />
            </label>
            <label className="text-sm text-gray-300 flex items-center gap-2">
              <input type="checkbox" checked={grayscale} onChange={(e) => setGrayscale(e.target.checked)} /> Grayscale
            </label>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="secondary" onClick={() => setRotate((r) => (r + 90) % 360)} className="text-xs py-1">Rotate 90°</Button>
            <Button variant="secondary" onClick={() => setFlipH((v) => !v)} className="text-xs py-1">Flip H</Button>
            <Button variant="secondary" onClick={() => setFlipV((v) => !v)} className="text-xs py-1">Flip V</Button>
            <Button variant="secondary" onClick={() => { setBrightness(0); setContrast(0); setSaturation(0); setGrayscale(false); setRotate(0); setFlipH(false); setFlipV(false); }} className="text-xs py-1">Reset</Button>
            <div className="ml-auto">
              <Button onClick={handleApply} disabled={disabled} className="text-sm">Apply</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;



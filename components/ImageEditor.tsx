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
  const [temperature, setTemperature] = React.useState<number>(0); // -100..100
  const [tint, setTint] = React.useState<number>(0); // -100..100
  const [highlights, setHighlights] = React.useState<number>(0); // -100..100
  const [shadows, setShadows] = React.useState<number>(0); // -100..100
  const [vignette, setVignette] = React.useState<number>(0); // 0..100
  const [aspectRatio, setAspectRatio] = React.useState<'Original' | '1:1' | '4:5' | '3:4' | '16:9'>('Original');
  const [cropEnabled, setCropEnabled] = React.useState<boolean>(false);
  const [cropRect, setCropRect] = React.useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = React.useState<null | { type: 'move' | 'nw' | 'ne' | 'sw' | 'se'; startX: number; startY: number; startRect: { x: number; y: number; w: number; h: number } }>(null);

  type Params = {
    brightness: number; contrast: number; saturation: number; grayscale: boolean;
    rotate: number; flipH: boolean; flipV: boolean; temperature: number; tint: number;
    highlights: number; shadows: number; vignette: number; aspectRatio: 'Original' | '1:1' | '4:5' | '3:4' | '16:9';
  };
  const [history, setHistory] = React.useState<Params[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState<number>(-1);
  const lastPushTsRef = React.useRef<number>(0);

  const snapshot = React.useCallback((): Params => ({
    brightness, contrast, saturation, grayscale,
    rotate, flipH, flipV, temperature, tint,
    highlights, shadows, vignette, aspectRatio,
  }), [brightness, contrast, saturation, grayscale, rotate, flipH, flipV, temperature, tint, highlights, shadows, vignette, aspectRatio]);

  const applyParams = (p: Params) => {
    setBrightness(p.brightness); setContrast(p.contrast); setSaturation(p.saturation); setGrayscale(p.grayscale);
    setRotate(p.rotate); setFlipH(p.flipH); setFlipV(p.flipV); setTemperature(p.temperature); setTint(p.tint);
    setHighlights(p.highlights); setShadows(p.shadows); setVignette(p.vignette); setAspectRatio(p.aspectRatio);
  };

  const recordSnapshot = () => {
    const now = Date.now();
    if (now - lastPushTsRef.current < 300) return; // throttle
    const curr = snapshot();
    const nextHist = history.slice(0, historyIndex + 1);
    nextHist.push(curr);
    setHistory(nextHist);
    setHistoryIndex(nextHist.length - 1);
    lastPushTsRef.current = now;
  };

  // Initialize crop rect when enabling crop
  React.useEffect(() => {
    if (cropEnabled && canvasRef.current) {
      const cw = canvasRef.current.width || 0;
      const ch = canvasRef.current.height || 0;
      const pad = Math.floor(Math.min(cw, ch) * 0.1);
      const initW = Math.max(50, cw - pad * 2);
      const initH = Math.max(50, ch - pad * 2);
      setCropRect({ x: pad, y: pad, w: initW, h: initH });
    }
  }, [cropEnabled]);

  const getScale = () => {
    const canvas = canvasRef.current;
    if (!canvas) return { sx: 1, sy: 1, left: 0, top: 0 };
    const rect = canvas.getBoundingClientRect();
    return { sx: rect.width / canvas.width, sy: rect.height / canvas.height, left: rect.left, top: rect.top };
  };

  const onMouseDownOverlay = (e: React.MouseEvent<HTMLDivElement>, type: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    if (!cropRect) return;
    setDragState({ type, startX: e.clientX, startY: e.clientY, startRect: { ...cropRect } });
  };
  const onMouseMoveWindow = (e: MouseEvent) => {
    if (!dragState || !cropRect || !canvasRef.current) return;
    const dx = (e.clientX - dragState.startX) / getScale().sx;
    const dy = (e.clientY - dragState.startY) / getScale().sy;
    let { x, y, w, h } = dragState.startRect;
    const lock = aspectRatio !== 'Original';
    const [rw, rh] = aspectRatio === '1:1' ? [1,1] : aspectRatio === '4:5' ? [4,5] : aspectRatio === '3:4' ? [3,4] : [16,9];
    const target = rw / rh;
    if (dragState.type === 'move') {
      x += dx; y += dy;
    } else {
      if (dragState.type === 'nw') { x += dx; w -= dx; y += dy; h -= dy; }
      if (dragState.type === 'ne') { w += dx; y += dy; h -= dy; }
      if (dragState.type === 'sw') { x += dx; w -= dx; h += dy; }
      if (dragState.type === 'se') { w += dx; h += dy; }
      if (lock) {
        // enforce aspect by adjusting h based on w
        h = Math.sign(h) * Math.abs(Math.round(w / target));
      }
    }
    const cw = canvasRef.current.width, ch = canvasRef.current.height;
    w = Math.max(20, Math.min(w, cw)); h = Math.max(20, Math.min(h, ch));
    x = Math.max(0, Math.min(x, cw - w)); y = Math.max(0, Math.min(y, ch - h));
    setCropRect({ x, y, w, h });
  };
  const onMouseUpWindow = () => setDragState(null);

  React.useEffect(() => {
    window.addEventListener('mousemove', onMouseMoveWindow);
    window.addEventListener('mouseup', onMouseUpWindow);
    return () => {
      window.removeEventListener('mousemove', onMouseMoveWindow);
      window.removeEventListener('mouseup', onMouseUpWindow);
    };
  }, [dragState, cropRect, aspectRatio]);

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

    // Post-process pixels for brightness/contrast/saturation/grayscale/temperature/tint/highlights/shadows
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const b = brightness; // -100..100
    const c = contrast; // -100..100 -> factor
    const s = saturation; // -100..100
    const temp = temperature; // -100..100
    const tn = tint; // -100..100
    const hl = highlights; // -100..100
    const sh = shadows; // -100..100

    // Compute factors
    const contrastFactor = (259 * (c + 255)) / (255 * (259 - c)); // classic contrast
    const satFactor = (s + 100) / 100; // 0..2
    const brightAdd = (b / 100) * 255; // -255..255
    const tempAdd = (temp / 100) * 30; // +/-30
    const tintAdd = (tn / 100) * 30; // +/-30

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

      // temperature (red/blue)
      r += tempAdd;
      bl -= tempAdd;

      // tint (green)
      g += tintAdd;

      // shadows/highlights (weighted by luminance)
      const l01 = Math.max(0, Math.min(1, lum / 255));
      const shadowWeight = 1 - l01;
      const highlightWeight = l01;
      const shAdd = (sh / 100) * 40 * shadowWeight;
      const hlAdd = (hl / 100) * 40 * highlightWeight;
      r += shAdd + hlAdd;
      g += shAdd + hlAdd;
      bl += shAdd + hlAdd;

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

    // Vignette radial darkening
    if (vignette > 0) {
      const strength = Math.max(0, Math.min(1, vignette / 100));
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const t = dist / maxDist;
          const factor = 1 - strength * (t * t);
          const idx = (y * canvas.width + x) * 4;
          d[idx] = Math.max(0, Math.min(255, d[idx] * factor));
          d[idx + 1] = Math.max(0, Math.min(255, d[idx + 1] * factor));
          d[idx + 2] = Math.max(0, Math.min(255, d[idx + 2] * factor));
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }, [brightness, contrast, saturation, grayscale, rotate, flipH, flipV, temperature, tint, highlights, shadows, vignette]);

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
    if (cropEnabled && cropRect) {
      const out = document.createElement('canvas');
      out.width = Math.round(cropRect.w); out.height = Math.round(cropRect.h);
      const octx = out.getContext('2d');
      if (octx && canvas) {
        octx.drawImage(canvas, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, out.width, out.height);
        const dataUrl = out.toDataURL('image/png');
        onApply(dataUrl);
        return;
      }
    } else if (aspectRatio !== 'Original') {
      const [rw, rh] = aspectRatio === '1:1' ? [1,1] : aspectRatio === '4:5' ? [4,5] : aspectRatio === '3:4' ? [3,4] : [16,9];
      const currW = canvas.width, currH = canvas.height;
      const targetRatio = rw / rh;
      let cropW = currW, cropH = Math.round(currW / targetRatio);
      if (cropH > currH) { cropH = currH; cropW = Math.round(currH * targetRatio); }
      const sx = Math.floor((currW - cropW) / 2);
      const sy = Math.floor((currH - cropH) / 2);
      const out = document.createElement('canvas');
      out.width = cropW; out.height = cropH;
      const octx = out.getContext('2d');
      if (octx) {
        octx.drawImage(canvas, sx, sy, cropW, cropH, 0, 0, cropW, cropH);
        const dataUrl = out.toDataURL('image/png');
        onApply(dataUrl);
        return;
      }
    }
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
            <div className="relative inline-block">
              <canvas ref={canvasRef} className="max-w-full h-auto max-h-[60vh]" />
              {/* hidden img used for drawing */}
              <img ref={imgRef} src={src} alt="editable" style={{ display: 'none' }} />
              {cropEnabled && cropRect && (
                <CropOverlay cropRect={cropRect} canvasRef={canvasRef} onMouseDown={onMouseDownOverlay} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-gray-300 flex flex-col gap-1">
              Brightness
              <input type="range" min={-100} max={100} value={brightness} onChange={(e) => { setBrightness(Number(e.target.value)); recordSnapshot(); }} />
            </label>
            <label className="text-sm text-gray-300 flex flex-col gap-1">
              Contrast
              <input type="range" min={-100} max={100} value={contrast} onChange={(e) => { setContrast(Number(e.target.value)); recordSnapshot(); }} />
            </label>
            <label className="text-sm text-gray-300 flex flex-col gap-1">
              Saturation
              <input type="range" min={-100} max={100} value={saturation} onChange={(e) => { setSaturation(Number(e.target.value)); recordSnapshot(); }} />
            </label>
            <label className="text-sm text-gray-300 flex items-center gap-2">
              <input type="checkbox" checked={grayscale} onChange={(e) => { setGrayscale(e.target.checked); recordSnapshot(); }} /> Grayscale
            </label>
            <label className="text-sm text-gray-300 flex flex-col gap-1">
              Temperature
              <input type="range" min={-100} max={100} value={temperature} onChange={(e) => { setTemperature(Number(e.target.value)); recordSnapshot(); }} />
            </label>
            <label className="text-sm text-gray-300 flex flex-col gap-1">
              Tint
              <input type="range" min={-100} max={100} value={tint} onChange={(e) => { setTint(Number(e.target.value)); recordSnapshot(); }} />
            </label>
            <label className="text-sm text-gray-300 flex flex-col gap-1">
              Highlights
              <input type="range" min={-100} max={100} value={highlights} onChange={(e) => { setHighlights(Number(e.target.value)); recordSnapshot(); }} />
            </label>
            <label className="text-sm text-gray-300 flex flex-col gap-1">
              Shadows
              <input type="range" min={-100} max={100} value={shadows} onChange={(e) => { setShadows(Number(e.target.value)); recordSnapshot(); }} />
            </label>
            <label className="text-sm text-gray-300 flex flex-col gap-1">
              Vignette
              <input type="range" min={0} max={100} value={vignette} onChange={(e) => { setVignette(Number(e.target.value)); recordSnapshot(); }} />
            </label>
            <label className="text-sm text-gray-300 flex flex-col gap-1">
              Crop Ratio
              <select value={aspectRatio} onChange={(e) => { setAspectRatio(e.target.value as any); recordSnapshot(); }} className="bg-gray-800/50 border border-gray-700/50 rounded-md px-2 py-1 text-gray-200">
                {['Original','1:1','4:5','3:4','16:9'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="text-sm text-gray-300 flex items-center gap-2">
              <input type="checkbox" checked={cropEnabled} onChange={(e) => setCropEnabled(e.target.checked)} /> Enable Crop Overlay
            </label>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="secondary" onClick={() => { setRotate((r) => (r + 90) % 360); recordSnapshot(); }} className="text-xs py-1">Rotate 90°</Button>
            <Button variant="secondary" onClick={() => { setFlipH((v) => !v); recordSnapshot(); }} className="text-xs py-1">Flip H</Button>
            <Button variant="secondary" onClick={() => { setFlipV((v) => !v); recordSnapshot(); }} className="text-xs py-1">Flip V</Button>
            <Button variant="secondary" onClick={() => { applyParams({ brightness:0, contrast:0, saturation:0, grayscale:false, rotate:0, flipH:false, flipV:false, temperature:0, tint:0, highlights:0, shadows:0, vignette:0, aspectRatio:'Original' }); recordSnapshot(); }} className="text-xs py-1">Reset</Button>
            <Button variant="secondary" onClick={() => { if (historyIndex > 0) { const p = history[historyIndex - 1]; applyParams(p); setHistoryIndex(historyIndex - 1); } }} className="text-xs py-1">Undo</Button>
            <Button variant="secondary" onClick={() => { if (historyIndex < history.length - 1) { const p = history[historyIndex + 1]; applyParams(p); setHistoryIndex(historyIndex + 1); } }} className="text-xs py-1">Redo</Button>
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

// Lightweight crop overlay component
function CropOverlay({ cropRect, canvasRef, onMouseDown }: { cropRect: { x: number; y: number; w: number; h: number }, canvasRef: React.RefObject<HTMLCanvasElement>, onMouseDown: (e: React.MouseEvent<HTMLDivElement>, type: 'move' | 'nw' | 'ne' | 'sw' | 'se') => void }) {
  const [style, setStyle] = React.useState<React.CSSProperties>({});
  const [handles, setHandles] = React.useState<{ [k: string]: React.CSSProperties }>({});

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width / canvas.width;
    const sy = rect.height / canvas.height;
    const left = cropRect.x * sx;
    const top = cropRect.y * sy;
    const width = cropRect.w * sx;
    const height = cropRect.h * sy;
    setStyle({ position: 'absolute', left, top, width, height, border: '2px solid rgba(59,130,246,0.9)', boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)', cursor: 'move' });
    const hs = 10;
    setHandles({
      nw: { position: 'absolute', left: -hs/2, top: -hs/2, width: hs, height: hs, background: '#fff', borderRadius: 2, cursor: 'nwse-resize' },
      ne: { position: 'absolute', right: -hs/2, top: -hs/2, width: hs, height: hs, background: '#fff', borderRadius: 2, cursor: 'nesw-resize' },
      sw: { position: 'absolute', left: -hs/2, bottom: -hs/2, width: hs, height: hs, background: '#fff', borderRadius: 2, cursor: 'nesw-resize' },
      se: { position: 'absolute', right: -hs/2, bottom: -hs/2, width: hs, height: hs, background: '#fff', borderRadius: 2, cursor: 'nwse-resize' },
    });
  }, [cropRect, canvasRef]);

  return (
    <div style={style} onMouseDown={(e) => onMouseDown(e, 'move')}>
      <div style={handles.nw} onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, 'nw'); }} />
      <div style={handles.ne} onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, 'ne'); }} />
      <div style={handles.sw} onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, 'sw'); }} />
      <div style={handles.se} onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, 'se'); }} />
    </div>
  );
}



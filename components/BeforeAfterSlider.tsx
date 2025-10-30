import React, { useState, useRef, useEffect } from 'react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    // Clamp between 0 and 100
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    setSliderPosition(clampedPercentage);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-2xl cursor-ew-resize select-none group"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* After Image (Full) */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt={afterLabel}
          className="w-full h-full object-cover"
          draggable="false"
        />
        {/* After Label */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-rich-black px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="w-full h-full object-cover"
          draggable="false"
        />
        {/* Before Label */}
        <div className="absolute top-4 left-4 bg-white text-rich-black px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Line and Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          {/* Left Arrow */}
          <svg
            className="w-4 h-4 text-gray-800 absolute left-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {/* Right Arrow */}
          <svg
            className="w-4 h-4 text-gray-800 absolute right-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      {/* Hint text (shows on hover) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-rich-black px-4 py-2 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none backdrop-blur-sm">
        Drag to compare
      </div>
    </div>
  );
};

export default BeforeAfterSlider;

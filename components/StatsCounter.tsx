import React, { useState, useEffect, useRef } from 'react';

interface StatProps {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

const StatCounter: React.FC<StatProps> = ({
  value,
  label,
  suffix = '',
  prefix = '',
  duration = 2000
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * value);

      setCount(currentCount);

      if (now < endTime) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isVisible, value, duration]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-rich-black mb-2">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-base sm:text-lg text-gray-600">{label}</div>
    </div>
  );
};

export default StatCounter;

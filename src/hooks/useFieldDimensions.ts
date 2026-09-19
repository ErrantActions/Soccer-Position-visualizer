import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { FieldDimensions } from '../types/soccer';

const defaultDimensions: FieldDimensions = { width: 0, height: 0, dpr: 1 };

export const useFieldDimensions = (ref: RefObject<HTMLElement | null>): FieldDimensions => {
  const [dimensions, setDimensions] = useState<FieldDimensions>(defaultDimensions);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const measure = () => {
      const rect = element.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        height: rect.height,
        dpr: window.devicePixelRatio || 1,
      });
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ref]);
  

  return dimensions;
};

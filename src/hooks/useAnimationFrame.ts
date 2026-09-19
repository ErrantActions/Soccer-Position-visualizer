import { useEffect, useRef } from 'react';

export const useAnimationFrame = (callback: () => void, active: boolean): void => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!active) {
      return;
    }

    let frameId = 0;

    const loop = () => {
      callbackRef.current();
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [active]);
};

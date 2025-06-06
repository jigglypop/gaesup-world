import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SCALE } from '../constants';

export const useMinimapControls = (
  initialScale: number = DEFAULT_SCALE,
  minScale: number,
  maxScale: number,
  blockScale: boolean,
  blockScaleControl: boolean
) => {
  const [scale, setScale] = useState(initialScale);

  const upscale = useCallback(() => {
    if (blockScale) return;
    setScale((prev) => Math.min(maxScale, prev + 0.1));
  }, [blockScale, maxScale]);

  const downscale = useCallback(() => {
    if (blockScale) return;
    setScale((prev) => Math.max(minScale, prev - 0.1));
  }, [blockScale, minScale]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (blockScale) return;
      if (e.deltaY < 0) upscale();
      else downscale();
    },
    [blockScale, upscale, downscale]
  );

  const setupWheelListener = useCallback(
    (canvasRef: React.RefObject<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handleNativeWheel = (e: WheelEvent) => {
        if (blockScale) return;
        e.preventDefault();
        if (e.deltaY < 0) upscale();
        else downscale();
      };

      canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
      
      return () => {
        canvas.removeEventListener('wheel', handleNativeWheel);
      };
    },
    [blockScale, upscale, downscale]
  );

  return {
    scale,
    upscale,
    downscale,
    handleWheel,
    setupWheelListener,
  };
}; 
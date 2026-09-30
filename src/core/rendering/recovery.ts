import { useEffect, useState } from 'react';

import { RENDERER_LOST_EVENT } from './webgpu';

/**
 * A key for the canvas that changes when its renderer loses the GPU device: `<Canvas key={useRendererRecovery()}>`
 * remounts with a fresh renderer and device, and the world, whose state lives outside the canvas, draws again.
 * `delayMs` lets the browser settle the lost device first.
 */
export function useRendererRecovery(delayMs = 300): number {
  const [key, setKey] = useState(0);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const lost = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setKey((value) => value + 1), delayMs);
    };
    window.addEventListener(RENDERER_LOST_EVENT, lost);
    return () => {
      window.removeEventListener(RENDERER_LOST_EVENT, lost);
      clearTimeout(timer);
    };
  }, [delayMs]);
  return key;
}

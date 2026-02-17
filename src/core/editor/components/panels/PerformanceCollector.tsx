import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';

import { useGaesupStore } from '../../../stores/gaesupStore';

/**
 * Collects WebGL/WebGPU renderer stats every 30 frames and writes them
 * to the Zustand performance slice. Must be placed inside <Canvas>.
 */
export function PerformanceCollector() {
  const gl = useThree((s) => s.gl);
  const setPerformance = useGaesupStore((s) => s.setPerformance);
  const frameCounter = useRef(0);

  useFrame(() => {
    frameCounter.current++;
    if (frameCounter.current < 30) return;
    frameCounter.current = 0;

    const info = gl.info;
    setPerformance({
      render: {
        calls: info.render.calls,
        triangles: info.render.triangles,
        points: info.render.points,
        lines: info.render.lines,
      },
      engine: {
        geometries: info.memory.geometries,
        textures: info.memory.textures,
      },
    });
  });

  return null;
}

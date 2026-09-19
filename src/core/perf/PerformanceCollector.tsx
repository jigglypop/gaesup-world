import { useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';

import { readRendererStats } from './rendererStats';
import { useGaesupStore } from '../stores/gaesupStore';

/**
 * Samples the last completed render at at most 4 Hz without taking over rendering.
 * Keep this outside editor code so regular worlds do not pull the editor chunk.
 */
export function PerformanceCollector() {
  const gl = useThree((s) => s.gl);
  const setPerformance = useGaesupStore((s) => s.setPerformance);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (elapsed.current < 0.25) return;
    elapsed.current = 0;

    const stats = readRendererStats(gl.info);
    setPerformance({
      render: {
        calls: stats.drawCalls,
        renderInvocations: stats.renderInvocations,
        counterScope: stats.counterScope,
        triangles: stats.triangles,
        points: stats.points,
        lines: stats.lines,
      },
      engine: {
        geometries: stats.geometries,
        textures: stats.textures,
        programs: stats.programs,
        allocatedBytesEstimate: stats.allocatedBytesEstimate,
      },
    });
  });

  return null;
}

export default PerformanceCollector;

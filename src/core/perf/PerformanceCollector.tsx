import { useRef } from 'react';

import { useThree } from '@react-three/fiber';

import { FRAME_PHASES, useCanvasFrameScheduler, useEngineFrame, type FramePhase } from '../runtime/frame';
import { useGaesupStore } from '../stores/gaesupStore';

/**
 * Collects renderer stats every 30 frames and writes them to the performance slice.
 * Keep this outside editor code so regular worlds do not pull the editor chunk.
 */
export function PerformanceCollector() {
  const gl = useThree((s) => s.gl);
  const setPerformance = useGaesupStore((s) => s.setPerformance);
  const setFramePhases = useGaesupStore((s) => s.setFramePhases);
  const scheduler = useCanvasFrameScheduler();
  const frameCounter = useRef(0);

  useEngineFrame('snapshot', () => {
    frameCounter.current++;
    if (frameCounter.current < 30) return;
    frameCounter.current = 0;

    const info = gl.info;
    const programs = 'programs' in info ? info.programs : undefined;
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
        programs: Array.isArray(programs) ? programs.length : 0,
      },
    });
    if (!scheduler.isMetricsEnabled()) return;
    const timings = {} as Record<FramePhase, number>;
    for (const phase of FRAME_PHASES) {
      const metrics = scheduler.getMetrics(phase);
      timings[phase] = metrics.calls > 0 ? metrics.totalMs / metrics.calls : 0;
    }
    scheduler.resetMetrics();
    setFramePhases(timings);
  }, { label: 'perf:renderer-stats' });

  return null;
}

export default PerformanceCollector;

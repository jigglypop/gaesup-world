import { useRef } from 'react';

import { useThree } from '@react-three/fiber';

import { readRendererStats } from './rendererStats';
import { FRAME_PHASES, useCanvasFrameScheduler, useEngineFrame, type FramePhase } from '../runtime/frame';
import { useGaesupStore } from '../stores/gaesupStore';

const SAMPLE_INTERVAL_SECONDS = 0.25;

/**
 * Samples the last completed render at at most 4 Hz without taking over rendering.
 * Keep this outside editor code so regular worlds do not pull the editor chunk.
 */
export function PerformanceCollector() {
  const gl = useThree((s) => s.gl);
  const setPerformance = useGaesupStore((s) => s.setPerformance);
  const setFramePhases = useGaesupStore((s) => s.setFramePhases);
  const scheduler = useCanvasFrameScheduler();
  const elapsed = useRef(0);

  useEngineFrame('snapshot', (delta) => {
    elapsed.current += delta;
    if (elapsed.current < SAMPLE_INTERVAL_SECONDS) return;
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

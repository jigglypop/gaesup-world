import { useEffect, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { usePerfStore } from './stores/perfStore';
import type { PerfTier } from './types';
import { countNearOnlyCasters } from '../rendering/sky/nearShadow';
import { useGaesupRuntime } from '../runtime/runtimeContext';
import { useGaesupStore } from '../stores/gaesupStore';
import type { EngineState, FramePhaseTimings, RenderState, ResolutionState, ShadowState } from '../stores/slices/performance/types';

export type FrameTimeSummary = { fps: number; avgMs: number; p50Ms: number; p95Ms: number; maxMs: number };

export type PerformanceReport = {
  /** Browser frame pacing over the last window, which is what the player feels. */
  frames: FrameTimeSummary;
  /** Frames the canvas drew per second; below `frames.fps` while `IdleFrameRate` throttles. Null without a runtime. */
  drawnFps: number | null;
  /** Fixed simulation ticks per second, 60 while the world runs. Null without a runtime. */
  fixedTicksPerSecond: number | null;
  /** JavaScript heap, where the browser reports it (Chromium). */
  memory: { usedMB: number; limitMB: number } | null;
  render: RenderState;
  engine: EngineState;
  /** Average CPU milliseconds per frame phase; null in production builds. */
  phases: FramePhaseTimings | null;
  tier: PerfTier;
  /** The sun's shadow maps and how many casters draw into the nearest cascade only; null without a shadow sun. */
  shadow: (ShadowState & { nearOnlyCasters: number }) | null;
  /** The canvas pixel ratio and its ceiling; null while no quality profile sizes the canvas. */
  resolution: ResolutionState | null;
  /** GPU milliseconds of recent frames (WebGPU timestamp queries); null where they are not measured. */
  gpuMs: number | null;
  /** Frames held back by the CPU while `quality="auto"` watches; shadows and residents shed work meanwhile. */
  cpuBound: boolean;
};

const EMPTY_FRAMES: FrameTimeSummary = { fps: 0, avgMs: 0, p50Ms: 0, p95Ms: 0, maxMs: 0 };

/** Frame rate and interval percentiles of the frame intervals (ms) measured over `windowMs`. */
export function summarizeFrameTimes(intervals: readonly number[], windowMs: number): FrameTimeSummary {
  if (!intervals.length || windowMs <= 0) return EMPTY_FRAMES;
  const sorted = [...intervals].sort((a, b) => a - b);
  const at = (fraction: number) => sorted[Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))]!;
  const total = sorted.reduce((sum, value) => sum + value, 0);
  return {
    fps: (intervals.length * 1000) / windowMs,
    avgMs: total / sorted.length,
    p50Ms: at(0.5),
    p95Ms: at(0.95),
    maxMs: sorted[sorted.length - 1]!,
  };
}

type Timing = Pick<PerformanceReport, 'frames' | 'drawnFps' | 'fixedTicksPerSecond' | 'memory'> & { nearOnlyCasters: number };

const readMemory = (): PerformanceReport['memory'] => {
  const memory = (globalThis.performance as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
  return memory ? { usedMB: memory.usedJSHeapSize / 1048576, limitMB: memory.jsHeapSizeLimit / 1048576 } : null;
};

/**
 * Everything a status panel shows about the nearest world, refreshed every `intervalMs`. While mounted it keeps
 * renderer sampling on, production builds included.
 */
export function usePerformanceReport(intervalMs = 500): PerformanceReport {
  const runtime = useGaesupRuntime();
  const retain = useGaesupStore((state) => state.retainPerformanceSampling);
  const { render, engine } = useGaesupStore(useShallow((state) => state.performance));
  const phases = useGaesupStore((state) => state.framePhases);
  const shadow = useGaesupStore((state) => state.shadow);
  const resolution = useGaesupStore((state) => state.resolution);
  const gpuMs = useGaesupStore((state) => state.gpuMs);
  const cpuBound = useGaesupStore((state) => state.cpuBound);
  const tier = usePerfStore((state) => state.profile.tier);
  const [timing, setTiming] = useState<Timing>({ frames: EMPTY_FRAMES, drawnFps: null, fixedTicksPerSecond: null, memory: null, nearOnlyCasters: 0 });

  useEffect(() => retain(), [retain]);

  useEffect(() => {
    const intervals: number[] = [];
    const counters = () => runtime?.stats.snapshot();
    let previous = counters();
    let last = 0;
    let windowStart = globalThis.performance.now();
    let handle = requestAnimationFrame(function tick(now) {
      if (last) intervals.push(now - last);
      last = now;
      const elapsed = now - windowStart;
      if (elapsed >= intervalMs) {
        const current = counters();
        // Counters count from their last reset; a reset by someone else shows up as a negative delta and is skipped.
        const perSecond = (key: 'frames' | 'fixedTicks') => {
          const delta = (current?.[key] ?? 0) - (previous?.[key] ?? 0);
          return current && delta >= 0 ? (delta * 1000) / elapsed : null;
        };
        setTiming({
          frames: summarizeFrameTimes(intervals, elapsed),
          drawnFps: perSecond('frames'),
          fixedTicksPerSecond: perSecond('fixedTicks'),
          memory: readMemory(),
          nearOnlyCasters: countNearOnlyCasters(),
        });
        previous = current;
        intervals.length = 0;
        windowStart = now;
      }
      handle = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(handle);
  }, [intervalMs, runtime]);

  const { nearOnlyCasters, ...rest } = timing;
  return { ...rest, render, engine, phases, tier, shadow: shadow ? { ...shadow, nearOnlyCasters } : null, resolution, gpuMs, cpuBound };
}

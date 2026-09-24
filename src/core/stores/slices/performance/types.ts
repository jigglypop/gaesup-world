import type { FramePhase } from '../../../runtime/frame/types';

export type FramePhaseTimings = Readonly<Record<FramePhase, number>>;

export type RenderState = {
  /** Draw calls for both renderer families; retained for API compatibility. */
  calls: number;
  renderInvocations?: number | null;
  counterScope?: 'renderer-frame' | 'last-render' | 'since-reset';
  triangles: number;
  points: number;
  lines: number;
};

export type EngineState = {
  geometries: number;
  textures: number;
  programs: number;
  allocatedBytesEstimate?: number | null;
};

export interface PerformanceState {
  performance: {
    render: RenderState;
    engine: EngineState;
  };
  setPerformance: (performance: {
    render: RenderState;
    engine: EngineState;
  }) => void;
  framePhases: FramePhaseTimings | null;
  setFramePhases: (timings: FramePhaseTimings) => void;
  /** Active consumers of `performance`/`framePhases`; renderer sampling runs only while this is above zero (or when forced on). */
  performanceSamplers: number;
  retainPerformanceSampling: () => () => void;
} 

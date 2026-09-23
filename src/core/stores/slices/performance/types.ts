import type { FramePhase } from '../../../runtime/frame/types';

export type FramePhaseTimings = Readonly<Record<FramePhase, number>>;

export type RenderState = {
  calls: number;
  triangles: number;
  points: number;
  lines: number;
};

export type EngineState = {
  geometries: number;
  textures: number;
  programs: number;
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
} 
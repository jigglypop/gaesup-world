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
  /** How the canvas draws: WebGPU, `WebGPURenderer`'s WebGL2 fallback, or a classic `WebGLRenderer`. */
  backend?: 'webgpu' | 'webgpu-fallback' | 'webgl';
};

export type EngineState = {
  geometries: number;
  textures: number;
  programs: number;
  allocatedBytesEstimate?: number | null;
};

/** The sun's shadow maps as `CascadedSun` set them up. */
export type ShadowState = {
  /** Cascades on WebGPU, 1 for the single WebGL map. */
  maps: number;
  mapSize: number;
  /** Redraws a second of the nearest map and of each farther one; `Infinity` means every frame. */
  nearHz: number;
  farHz: number;
};

/** The canvas resolution a quality profile set. */
export type ResolutionState = {
  /** Pixel ratio the canvas draws at now. */
  pixelRatio: number;
  /** The profile's ratio: `quality="auto"` lowers the canvas under load and raises it back up to this. */
  maxPixelRatio: number;
  adaptive: boolean;
};

export interface PerformanceState {
  performance: {
    render: RenderState;
    engine: EngineState;
  };
  /** Null while no shadow-casting sun is mounted. */
  shadow: ShadowState | null;
  setShadow: (shadow: ShadowState | null) => void;
  /** Null while no quality profile sizes the canvas. */
  resolution: ResolutionState | null;
  setResolution: (resolution: ResolutionState | null) => void;
  /** GPU milliseconds of recent frames from timestamp queries; null where the renderer cannot measure them. */
  gpuMs: number | null;
  setGpuMs: (gpuMs: number | null) => void;
  /**
   * `quality="auto"` found frames held back by the CPU. Systems shed CPU work while it is set: the sun redraws its
   * shadow maps less often and `NPCSystem` draws only the nearest residents.
   */
  cpuBound: boolean;
  setCpuBound: (cpuBound: boolean) => void;
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

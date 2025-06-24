export type RenderState = {
  calls: number;
  triangles: number;
  points: number;
  lines: number;
};

export type EngineState = {
  geometries: number;
  textures: number;
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
} 
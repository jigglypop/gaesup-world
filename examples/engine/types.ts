export type CullingMode = 'gpu' | 'cpu' | 'all';
export type EngineSettings = {
  count: number;
  mode: CullingMode;
  orbit: boolean;
  sunset: boolean;
  view: 'overview' | 'trail' | 'sky';
};
export type EngineStats = {
  backend: string;
  visible: number;
  total: number;
  frameMs: number;
  cullMs: number;
  drawCalls: number;
  mode: CullingMode;
};

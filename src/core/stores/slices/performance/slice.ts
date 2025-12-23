import { StateCreator } from 'zustand';

import { PerformanceState, RenderState, EngineState } from './types';

export const initialPerformanceState = {
  render: {
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0,
  },
  engine: {
    geometries: 0,
    textures: 0,
  },
};

export const createPerformanceSlice: StateCreator<
  PerformanceState,
  [],
  [],
  PerformanceState
> = (set) => ({
  performance: initialPerformanceState,
  setPerformance: (performance: { render: RenderState; engine: EngineState }) =>
    set({
      performance,
    }),
}); 
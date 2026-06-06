import { StateCreator } from 'zustand';

import { PerformanceState, RenderState, EngineState } from './types';

function sameRenderState(a: RenderState, b: RenderState): boolean {
  return a.calls === b.calls &&
    a.triangles === b.triangles &&
    a.points === b.points &&
    a.lines === b.lines;
}

function sameEngineState(a: EngineState, b: EngineState): boolean {
  return a.geometries === b.geometries &&
    a.textures === b.textures &&
    a.programs === b.programs;
}

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
    programs: 0,
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
    set((state) => {
      if (
        sameRenderState(state.performance.render, performance.render) &&
        sameEngineState(state.performance.engine, performance.engine)
      ) {
        return state;
      }
      return { performance };
    }),
}); 

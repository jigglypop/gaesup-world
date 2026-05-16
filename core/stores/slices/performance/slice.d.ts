import { StateCreator } from 'zustand';
import { PerformanceState } from './types';
export declare const initialPerformanceState: {
    render: {
        calls: number;
        triangles: number;
        points: number;
        lines: number;
    };
    engine: {
        geometries: number;
        textures: number;
        programs: number;
    };
};
export declare const createPerformanceSlice: StateCreator<PerformanceState, [
], [
], PerformanceState>;

import type { CropId, FarmingSerialized, Plot } from '../types';
type State = {
    plots: Record<string, Plot>;
    registerPlot: (plot: Pick<Plot, 'id' | 'position'> & Partial<Omit<Plot, 'id' | 'position'>>) => void;
    unregisterPlot: (id: string) => void;
    till: (id: string) => boolean;
    plant: (id: string, cropId: CropId, currentMinutes: number) => boolean;
    water: (id: string, currentMinutes: number) => boolean;
    harvest: (id: string) => boolean;
    tick: (currentMinutes: number) => void;
    near: (x: number, z: number, radius: number) => Plot | null;
    serialize: () => FarmingSerialized;
    hydrate: (data: FarmingSerialized | null | undefined) => void;
};
export declare const usePlotStore: import("zustand").UseBoundStore<import("zustand").StoreApi<State>>;
export {};

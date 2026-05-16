import { PhysicsSlice } from '../slices/physics';
export type PhysicsStore = PhysicsSlice;
export declare const usePhysicsStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<PhysicsSlice>, "setState" | "devtools"> & {
    setState(partial: PhysicsSlice | Partial<PhysicsSlice> | ((state: PhysicsSlice) => PhysicsSlice | Partial<PhysicsSlice>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: PhysicsSlice | ((state: PhysicsSlice) => PhysicsSlice), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}>;

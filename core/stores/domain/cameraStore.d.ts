import { CameraOptionSlice } from '@core/camera/stores/slices/cameraOption';
export type CameraStore = CameraOptionSlice;
export declare const useCameraStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<CameraOptionSlice>, "setState" | "devtools"> & {
    setState(partial: CameraOptionSlice | Partial<CameraOptionSlice> | ((state: CameraOptionSlice) => CameraOptionSlice | Partial<CameraOptionSlice>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: CameraOptionSlice | ((state: CameraOptionSlice) => CameraOptionSlice), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: CameraOptionSlice, previousSelectedState: CameraOptionSlice) => void): () => void;
        <U>(selector: (state: CameraOptionSlice) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: (a: U, b: U) => boolean;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;

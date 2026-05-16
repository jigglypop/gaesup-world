import { GaesupState } from './types';
export declare const useGaesupStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<GaesupState>, "setState" | "devtools"> & {
    setState(partial: GaesupState | Partial<GaesupState> | ((state: GaesupState) => GaesupState | Partial<GaesupState>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: GaesupState | ((state: GaesupState) => GaesupState), replace: true, action?: (string | {
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
        (listener: (selectedState: GaesupState, previousSelectedState: GaesupState) => void): () => void;
        <U>(selector: (state: GaesupState) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: (a: U, b: U) => boolean;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;

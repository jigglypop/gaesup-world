import { ModeSlice, UrlsSlice, SizesSlice, PerformanceState } from '../slices';
export type UIStore = ModeSlice & UrlsSlice & SizesSlice & PerformanceState;
export declare const useUIStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<UIStore>, "setState" | "devtools"> & {
    setState(partial: UIStore | Partial<UIStore> | ((state: UIStore) => UIStore | Partial<UIStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: UIStore | ((state: UIStore) => UIStore), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}>;

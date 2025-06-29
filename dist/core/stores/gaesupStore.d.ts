export declare const useGaesupStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<any>, "setState" | "devtools"> & {
    setState(partial: any, replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: any, replace: true, action?: (string | {
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
        (listener: (selectedState: any, previousSelectedState: any) => void): () => void;
        <U>(selector: (state: any) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: (a: U, b: U) => boolean;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;

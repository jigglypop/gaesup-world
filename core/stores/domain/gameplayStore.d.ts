import type { AnimationSlice } from '@core/animation/stores/types';
import type { InteractionActions, InteractionSliceState } from '@core/interactions/stores/types';
import { RideableSlice } from '../slices';
type AnimationStoreSlice = Omit<AnimationSlice, 'getAnimation' | 'getCurrentAnimation'>;
type InteractionSlice = InteractionSliceState & InteractionActions;
export type GameplayStore = RideableSlice & AnimationStoreSlice & InteractionSlice;
export declare const useGameplayStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<GameplayStore>, "setState" | "devtools"> & {
    setState(partial: GameplayStore | Partial<GameplayStore> | ((state: GameplayStore) => GameplayStore | Partial<GameplayStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: GameplayStore | ((state: GameplayStore) => GameplayStore), replace: true, action?: (string | {
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
        (listener: (selectedState: GameplayStore, previousSelectedState: GameplayStore) => void): () => void;
        <U>(selector: (state: GameplayStore) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: (a: U, b: U) => boolean;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
export {};

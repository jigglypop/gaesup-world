import { StateCreator } from 'zustand';
import { AnimationSlice, AnimationState } from "./types"

export const createAnimationSlice: StateCreator<AnimationSlice, [], [], AnimationSlice> = (
    set,
    get,
) => ({
    animationState: {
        character: {
            current: 'idle',
            default: 'idle',
            store: {},
        },
        vehicle: {
            current: 'idle',
            default: 'idle',
            store: {},
        },
        airplane: {
            current: 'idle',
            default: 'idle',
            store: {},
        },
    },
    setCurrentAnimation: (type, newCurrent) =>
        set((state) => ({
            animationState: {
                ...state.animationState,
                [type]: {
                    ...state.animationState[type],
                    current: newCurrent,
                },
            } as AnimationState,
        })),
    setAnimationStore: (type, newStore) =>
        set((state) => ({
            animationState: {
                ...state.animationState,
                [type]: {
                    ...state.animationState[type],
                    store: newStore,
                },
            } as AnimationState,
        })),
    getCurrentAnimation: (type) => {
        const anim = get().animationState[type];
        return anim ? anim.current : 'idle';
    },
    getAnimationStore: (type) => {
        const anim = get().animationState[type];
        return anim ? anim.store : {};
    },
});

import type { GameTime, TimeMode, TimeSerialized } from '../types';
type TimeListener = (event: {
    kind: 'newDay' | 'newHour';
    time: GameTime;
}) => void;
type TimeState = {
    mode: TimeMode;
    scale: number;
    startEpochMs: number;
    totalMinutes: number;
    paused: boolean;
    time: GameTime;
    listeners: Set<TimeListener>;
    tick: (realDeltaMs: number) => void;
    setScale: (scale: number) => void;
    setMode: (mode: TimeMode) => void;
    setTotalMinutes: (totalMinutes: number) => void;
    pause: () => void;
    resume: () => void;
    addListener: (l: TimeListener) => () => void;
    serialize: () => TimeSerialized;
    hydrate: (s: TimeSerialized | null | undefined) => void;
};
export declare const useTimeStore: import("zustand").UseBoundStore<import("zustand").StoreApi<TimeState>>;
export {};

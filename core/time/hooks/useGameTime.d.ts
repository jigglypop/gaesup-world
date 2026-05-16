import type { GameTime } from '../types';
export declare function useGameTime(): GameTime;
export declare function useTimeOfDay(): {
    hour: number;
    minute: number;
};
export declare function useGameClock(enabled?: boolean): void;
export declare function useDayChange(handler: (g: GameTime) => void): void;
export declare function useHourChange(handler: (g: GameTime) => void): void;

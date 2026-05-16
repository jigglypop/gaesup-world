import type { GameTime } from '../types';
export declare function computeGameTime(totalMinutes: number): GameTime;
export declare function realMsToGameMinutes(realMs: number, scale: number): number;
export declare function isNewDay(prevTotalMinutes: number, nextTotalMinutes: number): boolean;
export declare function isNewHour(prevTotalMinutes: number, nextTotalMinutes: number): boolean;
export declare const TIME_CONSTANTS: {
    readonly MINUTES_PER_HOUR: 60;
    readonly MINUTES_PER_DAY: number;
    readonly MINUTES_PER_MONTH: number;
    readonly MINUTES_PER_YEAR: number;
    readonly DAYS_PER_MONTH: 30;
    readonly MONTHS_PER_YEAR: 12;
    readonly HOURS_PER_DAY: 24;
};

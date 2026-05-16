import type { GameTime, Weekday } from '../../time/types';
export type NPCActivity = 'idle' | 'walk' | 'work' | 'shop' | 'sleep' | 'fish' | 'eat' | 'play';
export type NPCScheduleEntry = {
    startHour: number;
    endHour: number;
    position: [number, number, number];
    activity?: NPCActivity;
    dialogTreeId?: string;
    rotationY?: number;
    weekdays?: Weekday[];
    seasons?: GameTime['season'][];
};
export type NPCSchedule = {
    npcId: string;
    defaultEntry?: Omit<NPCScheduleEntry, 'startHour' | 'endHour'>;
    entries: NPCScheduleEntry[];
};
export type ActiveSlot = {
    position: [number, number, number];
    rotationY?: number;
    activity: NPCActivity;
    dialogTreeId?: string;
    source: NPCScheduleEntry | null;
};
export declare function resolveSchedule(schedule: NPCSchedule, time: GameTime): ActiveSlot;
declare class SchedulerRegistry {
    private map;
    register(schedule: NPCSchedule): void;
    unregister(npcId: string): void;
    get(npcId: string): NPCSchedule | undefined;
    resolve(npcId: string, time: GameTime): ActiveSlot | null;
    all(): NPCSchedule[];
    clear(): void;
}
export declare function getNPCScheduler(): SchedulerRegistry;
export type { SchedulerRegistry };

import type { QuestDef, QuestId } from '../types';
declare class QuestRegistry {
    private defs;
    register(def: QuestDef): void;
    registerAll(defs: QuestDef[]): void;
    get(id: QuestId): QuestDef | undefined;
    require(id: QuestId): QuestDef;
    all(): QuestDef[];
    has(id: QuestId): boolean;
    clear(): void;
}
export declare function getQuestRegistry(): QuestRegistry;
export type { QuestRegistry };

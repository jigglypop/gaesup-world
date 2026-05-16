import type { QuestSerialized } from './types';
export interface QuestsPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeQuestsState(): QuestSerialized;
export declare function hydrateQuestsState(data: QuestSerialized | null | undefined): void;
export declare function createQuestsPlugin(options?: QuestsPluginOptions): import("..").GaesupPlugin;
export declare const questsPlugin: import("..").GaesupPlugin;

import type { SceneSerialized } from './types';
export interface ScenePluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeSceneState(): SceneSerialized;
export declare function hydrateSceneState(data: SceneSerialized | null | undefined): void;
export declare function createScenePlugin(options?: ScenePluginOptions): import("..").GaesupPlugin;
export declare const scenePlugin: import("..").GaesupPlugin;

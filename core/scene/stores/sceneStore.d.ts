import { type SceneDescriptor, type SceneEntry, type SceneId, type SceneSerialized } from '../types';
type TransitionState = {
    /** 0 (no fade) → 1 (fully opaque) */
    progress: number;
    /** Color of the fade overlay (e.g. white for daytime, black for night). */
    color: string;
    /** When true, overlay is currently up; consumers can render their UI. */
    active: boolean;
};
type SceneState = {
    current: SceneId;
    /** When mid-transition, the id we are heading to. */
    pending: SceneId | null;
    scenes: Record<SceneId, SceneDescriptor>;
    transition: TransitionState;
    /**
     * Last outdoor return point: stored when leaving the outdoor scene so an
     * interior can warp the player back to where they were.
     */
    lastReturnPoint: SceneEntry | null;
    registerScene: (scene: SceneDescriptor) => void;
    unregisterScene: (id: SceneId) => void;
    goTo: (id: SceneId, options?: {
        entry?: SceneEntry;
        saveReturn?: SceneEntry;
    }) => Promise<void>;
    setTransition: (next: Partial<TransitionState>) => void;
    setReturnPoint: (entry: SceneEntry | null) => void;
    serialize: () => SceneSerialized;
    hydrate: (data: SceneSerialized | null | undefined) => void;
};
export declare const useSceneStore: import("zustand").UseBoundStore<import("zustand").StoreApi<SceneState>>;
export {};

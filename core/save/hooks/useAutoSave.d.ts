export type AutoSaveOptions = {
    intervalMs?: number;
    slot?: string;
    saveOnUnload?: boolean;
    saveOnVisibilityChange?: boolean;
};
export declare function useAutoSave({ intervalMs, slot, saveOnUnload, saveOnVisibilityChange, }?: AutoSaveOptions): void;
export declare function useLoadOnMount(slot?: string, onLoaded?: (loaded: boolean) => void): void;

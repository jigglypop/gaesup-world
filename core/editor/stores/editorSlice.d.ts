import { StateCreator } from 'zustand';
export interface EditorState {
    selectedObjectIds: string[];
    setSelectedObjectIds: (ids: string[]) => void;
    layoutConfig: object | null;
    setLayoutConfig: (config: object) => void;
    activeNodeGraph: object | null;
    setActiveNodeGraph: (graph: object | null) => void;
    clipboard: object | null;
    setClipboard: (data: object | null) => void;
}
export declare const createEditorSlice: StateCreator<EditorState>;
export declare const editorSlice: StateCreator<EditorState>;

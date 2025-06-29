import { EditorState } from '../stores/editorSlice';
export declare const useEditorStore: import("zustand").UseBoundStore<import("zustand").StoreApi<EditorState>>;
export declare const useEditor: () => {
    selectObject: (id: string) => void;
    selectMultiple: (ids: string[]) => void;
    clearSelection: () => void;
    selectedObjectIds: string[];
    setSelectedObjectIds: (ids: string[]) => void;
    layoutConfig: object | null;
    setLayoutConfig: (config: object) => void;
    activeNodeGraph: object | null;
    setActiveNodeGraph: (graph: object | null) => void;
    clipboard: object | null;
    setClipboard: (data: object | null) => void;
};

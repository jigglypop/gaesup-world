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

export const createEditorSlice: StateCreator<EditorState> = (set) => ({
  selectedObjectIds: [],
  setSelectedObjectIds: (ids: string[]) => set({ selectedObjectIds: ids }),
  
  layoutConfig: null,
  setLayoutConfig: (config: object) => set({ layoutConfig: config }),
  
  activeNodeGraph: null,
  setActiveNodeGraph: (graph: object | null) => set({ activeNodeGraph: graph }),
  
  clipboard: null,
  setClipboard: (data: object | null) => set({ clipboard: data }),
});

export const editorSlice = createEditorSlice; 
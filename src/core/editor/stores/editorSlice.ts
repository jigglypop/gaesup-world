import { StateCreator } from 'zustand';

import type { EditorPlayMode } from '../playMode';
import { createEditorSaveStatus, type EditorSaveStatus } from '../saveState';
import {
  EMPTY_EDITOR_SELECTION,
  clearEditorSelection,
  createEditorSelectionState,
  selectSceneObject,
  setSceneObjectHover,
  type EditorSelectionState,
  type SelectSceneObjectOptions,
} from '../selection';

export interface EditorState {
  selectedObjectIds: string[];
  activeObjectId: string | undefined;
  hoveredObjectId: string | undefined;
  playMode: EditorPlayMode;
  saveStatus: EditorSaveStatus;
  setSelectedObjectIds: (ids: string[]) => void;
  selectObject: (id: string, options?: SelectSceneObjectOptions) => void;
  setHoveredObjectId: (id: string | undefined) => void;
  setPlayMode: (mode: EditorPlayMode) => void;
  setSaveStatus: (status: EditorSaveStatus) => void;
  updateSaveStatus: (patch: Partial<EditorSaveStatus>) => void;
  clearSelection: () => void;
  
  layoutConfig: object | null;
  setLayoutConfig: (config: object) => void;
  
  activeNodeGraph: object | null;
  setActiveNodeGraph: (graph: object | null) => void;
  
  clipboard: object | null;
  setClipboard: (data: object | null) => void;
}

export const createEditorSlice: StateCreator<EditorState> = (set) => ({
  selectedObjectIds: EMPTY_EDITOR_SELECTION.selectedObjectIds,
  activeObjectId: EMPTY_EDITOR_SELECTION.activeObjectId,
  hoveredObjectId: EMPTY_EDITOR_SELECTION.hoveredObjectId,
  playMode: 'edit',
  saveStatus: createEditorSaveStatus(),
  setSelectedObjectIds: (ids: string[]) => set(selectionToSlice(createEditorSelectionState({ selectedObjectIds: ids }))),
  selectObject: (id: string, options?: SelectSceneObjectOptions) => set((state) => selectionToSlice(selectSceneObject(state, id, options))),
  setHoveredObjectId: (id: string | undefined) => set((state) => selectionToSlice(setSceneObjectHover(state, id))),
  setPlayMode: (mode: EditorPlayMode) => set({ playMode: mode }),
  setSaveStatus: (status: EditorSaveStatus) => set({ saveStatus: status }),
  updateSaveStatus: (patch: Partial<EditorSaveStatus>) => set((state) => ({ saveStatus: { ...state.saveStatus, ...patch } })),
  clearSelection: () => set((state) => selectionToSlice(clearEditorSelection(state))),
  
  layoutConfig: null,
  setLayoutConfig: (config: object) => set({ layoutConfig: config }),
  
  activeNodeGraph: null,
  setActiveNodeGraph: (graph: object | null) => set({ activeNodeGraph: graph }),
  
  clipboard: null,
  setClipboard: (data: object | null) => set({ clipboard: data }),
});

export const editorSlice = createEditorSlice; 

function selectionToSlice(selection: EditorSelectionState): Pick<EditorState, 'selectedObjectIds' | 'activeObjectId' | 'hoveredObjectId'> {
  return {
    selectedObjectIds: selection.selectedObjectIds,
    activeObjectId: selection.activeObjectId,
    hoveredObjectId: selection.hoveredObjectId,
  };
}

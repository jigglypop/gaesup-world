import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { EditorState, createEditorSlice } from '../stores/editorSlice';

export const useEditorStore = create<EditorState>(createEditorSlice);

export const useEditor = () => {
  const store = useEditorStore(
    useShallow((state) => ({
      selectedObjectIds: state.selectedObjectIds,
      activeObjectId: state.activeObjectId,
      hoveredObjectId: state.hoveredObjectId,
      playMode: state.playMode,
      saveStatus: state.saveStatus,
      layoutConfig: state.layoutConfig,
      activeNodeGraph: state.activeNodeGraph,
      clipboard: state.clipboard,
      setSelectedObjectIds: state.setSelectedObjectIds,
      selectObject: state.selectObject,
      setHoveredObjectId: state.setHoveredObjectId,
      setPlayMode: state.setPlayMode,
      setSaveStatus: state.setSaveStatus,
      updateSaveStatus: state.updateSaveStatus,
      clearSelection: state.clearSelection,
      setLayoutConfig: state.setLayoutConfig,
      setActiveNodeGraph: state.setActiveNodeGraph,
      setClipboard: state.setClipboard,
    })),
  );
  return {
    ...store,
    selectObject: store.selectObject,
    selectMultiple: (ids: string[]) => store.setSelectedObjectIds(ids),
    clearSelection: store.clearSelection,
  };
}; 

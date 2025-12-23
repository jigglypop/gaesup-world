import { create } from 'zustand';

import { EditorState, createEditorSlice } from '../stores/editorSlice';

export const useEditorStore = create<EditorState>(createEditorSlice);

export const useEditor = () => {
  const store = useEditorStore();
  return {
    ...store,
    selectObject: (id: string) => store.setSelectedObjectIds([id]),
    selectMultiple: (ids: string[]) => store.setSelectedObjectIds(ids),
    clearSelection: () => store.setSelectedObjectIds([]),
  };
}; 
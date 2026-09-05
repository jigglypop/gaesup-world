import type { SceneObject, SceneObjectId } from '../scene-object';

export type EditorSelectionMode = 'replace' | 'add' | 'toggle' | 'range';

export interface EditorSelectionState {
  selectedObjectIds: SceneObjectId[];
  activeObjectId: SceneObjectId | undefined;
  hoveredObjectId: SceneObjectId | undefined;
}

export interface SelectSceneObjectOptions {
  mode?: EditorSelectionMode;
  orderedObjectIds?: SceneObjectId[];
}

export const EMPTY_EDITOR_SELECTION: EditorSelectionState = {
  selectedObjectIds: [],
  activeObjectId: undefined,
  hoveredObjectId: undefined,
};

export function createEditorSelectionState(input: Partial<EditorSelectionState> = {}): EditorSelectionState {
  const selectedObjectIds = dedupeIds(input.selectedObjectIds ?? []);
  const activeObjectId = input.activeObjectId && selectedObjectIds.includes(input.activeObjectId)
    ? input.activeObjectId
    : selectedObjectIds.at(-1);

  return {
    selectedObjectIds,
    activeObjectId,
    hoveredObjectId: input.hoveredObjectId,
  };
}

export function selectSceneObject(
  state: EditorSelectionState,
  objectId: SceneObjectId,
  options: SelectSceneObjectOptions = {},
): EditorSelectionState {
  const mode = options.mode ?? 'replace';
  if (mode === 'add') {
    return createEditorSelectionState({
      ...state,
      selectedObjectIds: [...state.selectedObjectIds, objectId],
      activeObjectId: objectId,
    });
  }
  if (mode === 'toggle') {
    const isSelected = state.selectedObjectIds.includes(objectId);
    return createEditorSelectionState({
      ...state,
      selectedObjectIds: isSelected
        ? state.selectedObjectIds.filter((id) => id !== objectId)
        : [...state.selectedObjectIds, objectId],
      activeObjectId: isSelected ? state.selectedObjectIds.filter((id) => id !== objectId).at(-1) : objectId,
    });
  }
  if (mode === 'range') {
    return selectSceneObjectRange(state, objectId, options.orderedObjectIds ?? []);
  }
  return createEditorSelectionState({
    ...state,
    selectedObjectIds: [objectId],
    activeObjectId: objectId,
  });
}

export function selectSceneObjectRange(
  state: EditorSelectionState,
  objectId: SceneObjectId,
  orderedObjectIds: SceneObjectId[],
): EditorSelectionState {
  const anchorId = state.activeObjectId ?? state.selectedObjectIds.at(-1);
  const anchorIndex = anchorId ? orderedObjectIds.indexOf(anchorId) : -1;
  const targetIndex = orderedObjectIds.indexOf(objectId);
  if (anchorIndex < 0 || targetIndex < 0) {
    return selectSceneObject(state, objectId);
  }

  const start = Math.min(anchorIndex, targetIndex);
  const end = Math.max(anchorIndex, targetIndex);
  return createEditorSelectionState({
    ...state,
    selectedObjectIds: orderedObjectIds.slice(start, end + 1),
    activeObjectId: objectId,
  });
}

export function setSceneObjectHover(
  state: EditorSelectionState,
  objectId: SceneObjectId | undefined,
): EditorSelectionState {
  return {
    ...state,
    hoveredObjectId: objectId,
  };
}

export function clearEditorSelection(state: EditorSelectionState): EditorSelectionState {
  return {
    ...state,
    selectedObjectIds: [],
    activeObjectId: undefined,
  };
}

export function isSceneObjectSelected(state: Pick<EditorSelectionState, 'selectedObjectIds'>, objectId: SceneObjectId): boolean {
  return state.selectedObjectIds.includes(objectId);
}

export function getActiveSceneObject(
  objects: SceneObject[],
  state: Pick<EditorSelectionState, 'activeObjectId' | 'selectedObjectIds'>,
): SceneObject | undefined {
  const activeId = state.activeObjectId ?? state.selectedObjectIds.at(-1);
  return activeId ? objects.find((object) => object.id === activeId) : undefined;
}

function dedupeIds(ids: SceneObjectId[]): SceneObjectId[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

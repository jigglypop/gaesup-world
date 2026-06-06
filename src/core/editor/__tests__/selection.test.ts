import {
  EMPTY_EDITOR_SELECTION,
  clearEditorSelection,
  createEditorSelectionState,
  getActiveSceneObject,
  isSceneObjectSelected,
  selectSceneObject,
  setSceneObjectHover,
} from '../selection';

describe('editor selection system', () => {
  test('selects, adds, toggles, and clears scene objects', () => {
    let state = createEditorSelectionState();

    state = selectSceneObject(state, 'a');
    expect(state).toMatchObject({ selectedObjectIds: ['a'], activeObjectId: 'a' });

    state = selectSceneObject(state, 'b', { mode: 'add' });
    expect(state.selectedObjectIds).toEqual(['a', 'b']);
    expect(state.activeObjectId).toBe('b');

    state = selectSceneObject(state, 'a', { mode: 'toggle' });
    expect(state.selectedObjectIds).toEqual(['b']);
    expect(isSceneObjectSelected(state, 'a')).toBe(false);

    state = clearEditorSelection(state);
    expect(state.selectedObjectIds).toEqual([]);
    expect(state.activeObjectId).toBeUndefined();
  });

  test('selects ranges from the active object', () => {
    const state = selectSceneObject(
      createEditorSelectionState({ selectedObjectIds: ['b'], activeObjectId: 'b' }),
      'd',
      { mode: 'range', orderedObjectIds: ['a', 'b', 'c', 'd', 'e'] },
    );

    expect(state.selectedObjectIds).toEqual(['b', 'c', 'd']);
    expect(state.activeObjectId).toBe('d');
  });

  test('tracks hover and resolves active scene object', () => {
    const state = setSceneObjectHover(EMPTY_EDITOR_SELECTION, 'tree');
    const selected = createEditorSelectionState({ selectedObjectIds: ['player'] });
    const object = getActiveSceneObject([
      { id: 'tree', name: 'Tree', transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }, components: [], tags: [] },
      { id: 'player', name: 'Player', transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }, components: [], tags: [] },
    ], selected);

    expect(state.hoveredObjectId).toBe('tree');
    expect(object?.id).toBe('player');
  });
});

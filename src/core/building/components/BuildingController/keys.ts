import { useEffect } from 'react';

import { useWorldInputScope } from '../../../input/useWorldInputScope';
import { useBuildingStoreApi } from '../../stores/buildingStore';
import type { BuildingSystemState } from '../../types';

const QUARTER = Math.PI / 2;
const ARROWS: Record<string, number> = { ArrowUp: 0, ArrowRight: QUARTER, ArrowDown: Math.PI, ArrowLeft: QUARTER * 3 };

const isTyping = (event: KeyboardEvent) => {
  const target = event.composedPath()[0];
  return target instanceof HTMLElement && Boolean(
    target.closest('input, textarea, select') || target.isContentEditable
      || target.closest('[contenteditable]:not([contenteditable="false"])'),
  );
};

/**
 * Editing keys in wall, tile, block and object mode: arrows set the next piece's turn, R turns it a quarter further,
 * and Q/E lower and raise the stacking layer of tiles and blocks.
 */
export function useBuildingEditKeys(editMode: BuildingSystemState['editMode']): void {
  const inputScope = useWorldInputScope();
  const buildingStore = useBuildingStoreApi();
  useEffect(() => {
    if (editMode !== 'wall' && editMode !== 'tile' && editMode !== 'block' && editMode !== 'object') return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || isTyping(event)) return;
      const state = buildingStore.getState();
      const rotate = (rotation: number) => {
        if (editMode === 'wall') state.setWallRotation(rotation);
        else if (editMode === 'tile') state.setTileRotation(rotation);
        else if (editMode === 'object') state.setObjectRotation(rotation);
      };
      const arrow = ARROWS[event.key];
      if (arrow !== undefined) rotate(arrow);
      if (event.code === 'KeyR') {
        const current = editMode === 'wall' ? state.currentWallRotation : editMode === 'tile' ? state.currentTileRotation : state.currentObjectRotation;
        rotate((current + QUARTER) % (Math.PI * 2));
      }
      // Q/E: a manual layer on top of (or above) the stacking height found under the cursor.
      if (editMode !== 'tile' && editMode !== 'block') return;
      if (event.code === 'KeyQ' || event.key === 'q' || event.key === 'Q') state.setTileHeight(state.currentTileHeight - 1);
      else if (event.code === 'KeyE' || event.key === 'e' || event.key === 'E') state.setTileHeight(state.currentTileHeight + 1);
    };
    return inputScope.listen('keydown', handleKeyDown);
  }, [inputScope, buildingStore, editMode]);
}

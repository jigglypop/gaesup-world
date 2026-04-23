import React, { useEffect } from 'react';

import { WorldPage } from './World';
import { useBuildingStore } from '../../src';

/**
 * Edit-mode entry. Reuses the world canvas but mounts the in-game
 * editor overlay and forces building edit mode on, so creators can
 * place tiles and walls without first opening the building panel.
 */
export function EditPage() {
  const setEditMode = useBuildingStore((s) => s.setEditMode);

  useEffect(() => {
    setEditMode('tile');
    return () => { setEditMode('none'); };
  }, [setEditMode]);

  return <WorldPage showEditor />;
}

export default EditPage;

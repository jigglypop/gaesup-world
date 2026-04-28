import React, { useEffect } from 'react';

import { WorldPage } from './World';
import { useBuildingStore } from '../../src';


export function EditPage() {
  const setEditMode = useBuildingStore((s) => s.setEditMode);

  useEffect(() => {
    setEditMode('tile');
    return () => { setEditMode('none'); };
  }, [setEditMode]);

  return <WorldPage showEditor showHud />;
}

export default EditPage;

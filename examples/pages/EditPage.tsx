import React, { useEffect } from 'react';

import { useBuildingStore } from 'gaesup-world';

import { WorldPage } from './World';

export function EditPage() {
  const setEditMode = useBuildingStore((s) => s.setEditMode);
  const setWorldSurface = useBuildingStore((s) => s.setWorldSurface);

  useEffect(() => {
    setEditMode('tile');
    setWorldSurface('water');
    return () => {
      setEditMode('none');
      setWorldSurface('ground');
    };
  }, [setEditMode, setWorldSurface]);

  return <WorldPage showEditor showHud={false} />;
}

export default EditPage;

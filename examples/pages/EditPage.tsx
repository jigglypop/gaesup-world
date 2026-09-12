import { useLayoutEffect } from 'react';

import { useBuildingStore } from 'gaesup-world';

import { WorldPage } from './World';

export function EditPage() {
  const setEditMode = useBuildingStore((s) => s.setEditMode);
  useLayoutEffect(() => {
    setEditMode('tile');
    return () => {
      setEditMode('none');
    };
  }, [setEditMode]);

  return <WorldPage showEditor showHud={false} />;
}

export default EditPage;

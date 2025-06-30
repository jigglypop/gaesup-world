import { useEffect } from 'react';
import { BuildingUI, useBuildingStore } from '../../../src';

export function BuildingExample() {
  const initializeDefaults = useBuildingStore((state) => state.initializeDefaults);

  useEffect(() => {
    initializeDefaults();
  }, [initializeDefaults]);

  return <BuildingUI />;
} 
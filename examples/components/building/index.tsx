import { useEffect } from 'react';
import { BuildingUI, useBuildingStore } from '../../../src';

export type BuildingExampleProps = {
  onClose?: () => void;
};

export function BuildingExample({ onClose }: BuildingExampleProps) {
  const initializeDefaults = useBuildingStore((state) => state.initializeDefaults);

  useEffect(() => {
    initializeDefaults();
  }, [initializeDefaults]);

  return <BuildingUI onClose={onClose} />;
} 
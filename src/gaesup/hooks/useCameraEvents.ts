import { useEffect } from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '../stores/gaesupStore';
import { eventBus } from '../physics/connectors';
import { CameraControlMode, CameraOptionType } from '../types';

const modeOptions: Partial<Record<CameraControlMode, Partial<CameraOptionType>>> = {
  firstPerson: {
    yDistance: 1.6,
    smoothing: { position: 0.15, rotation: 0.15, fov: 0.1 },
  },
  chase: {
    yDistance: 3,
    smoothing: { position: 0.15, rotation: 0.12, fov: 0.1 },
  },
  topDown: {
    yDistance: 10,
    smoothing: { position: 0.05, rotation: 0.05, fov: 0.1 },
  },
  shoulder: {
    shoulderOffset: new THREE.Vector3(0.5, 1.5, -1),
    smoothing: { position: 0.1, rotation: 0.12, fov: 0.1 },
  },
  sideScroll: {
    fixedPosition: new THREE.Vector3(0, 5, 15),
    smoothing: { position: 0.08, rotation: 0.08, fov: 0.1 },
  },
  isometric: {
    isoAngle: 45,
    yDistance: 8,
    smoothing: { position: 0.06, rotation: 0.06, fov: 0.1 },
  },
  normal: {
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
  },
  thirdPerson: {
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
  },
};

export function useCameraEvents() {
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);

  useEffect(() => {
    const handleModeChange = (data: { control: CameraControlMode }) => {
      const newOptions = modeOptions[data.control] || modeOptions.thirdPerson;
      setCameraOption({
        ...newOptions,
      });
    };

    const unsubscribeModeChange = eventBus.subscribe('MODE_CHANGE', handleModeChange);

    return () => {
      unsubscribeModeChange();
    };
  }, [setCameraOption]);

  return { cameraOption, setCameraOption };
}

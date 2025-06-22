import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '@stores/gaesupStore';
import { CameraOptionType } from '@/core';

const CAMERA_MODE_PRESETS: Record<string, Partial<CameraOptionType>> = {
  firstPerson: {
    yDistance: 1.6,
    smoothing: { position: 0.15, rotation: 0.15, fov: 0.1 },
  },
  chase: {
    yDistance: 3,
    smoothing: { position: 1, rotation: 1, fov: 0.1 },
  },
  topDown: {
    yDistance: 10,
    smoothing: { position: 0.05, rotation: 0.05, fov: 0.1 },
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
  const mode = useGaesupStore((state) => state.mode);

  const currentModeOptions = useMemo(() => {
    if (!mode?.control) return CAMERA_MODE_PRESETS.thirdPerson;
    return CAMERA_MODE_PRESETS[mode.control] || CAMERA_MODE_PRESETS.thirdPerson;
  }, [mode?.control]);

  useEffect(() => {
    if (mode?.control && currentModeOptions) {
      setCameraOption({ ...currentModeOptions });
    }
  }, [mode?.control, currentModeOptions, setCameraOption]);

  return { cameraOption, setCameraOption };
} 
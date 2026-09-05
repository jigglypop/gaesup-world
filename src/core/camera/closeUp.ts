import * as THREE from 'three';

import { useGaesupStore } from '../stores/gaesupStore';
import type { CameraOptionType } from './core/types';

export type CameraCloseUpTarget =
  | THREE.Vector3
  | [number, number, number]
  | { x: number; y: number; z: number };

export type CameraCloseUpOptions = {
  focusDistance?: number;
  focusLerpSpeed?: number;
  fov?: number;
  enableCollision?: boolean;
  rememberPrevious?: boolean;
};

let previousCameraOption: CameraOptionType | null = null;

function cloneCameraOption(option: CameraOptionType): CameraOptionType {
  return {
    ...option,
    ...(option.offset ? { offset: option.offset.clone() } : {}),
    ...(option.target ? { target: option.target.clone() } : {}),
    ...(option.position ? { position: option.position.clone() } : {}),
    ...(option.focusTarget ? { focusTarget: option.focusTarget.clone() } : {}),
    ...(option.fixedPosition ? { fixedPosition: option.fixedPosition.clone() } : {}),
    ...(option.rotation ? { rotation: option.rotation.clone() } : {}),
    ...(option.smoothing ? { smoothing: { ...option.smoothing } } : {}),
    ...(option.bounds ? { bounds: { ...option.bounds } } : {}),
    ...(option.modeSettings ? { modeSettings: { ...option.modeSettings } } : {}),
  };
}

function toVector3(target: CameraCloseUpTarget): THREE.Vector3 {
  if (target instanceof THREE.Vector3) return target.clone();
  if (Array.isArray(target)) return new THREE.Vector3(target[0], target[1], target[2]);
  return new THREE.Vector3(target.x, target.y, target.z);
}

export function createCameraCloseUpPreset(
  target: CameraCloseUpTarget,
  options: CameraCloseUpOptions = {},
): Partial<CameraOptionType> {
  return {
    enableFocus: true,
    focus: true,
    focusTarget: toVector3(target),
    focusDistance: options.focusDistance ?? 4,
    focusLerpSpeed: options.focusLerpSpeed ?? 8,
    fov: options.fov ?? 46,
    enableCollision: options.enableCollision ?? false,
  };
}

export function requestCameraCloseUp(
  target: CameraCloseUpTarget,
  options: CameraCloseUpOptions = {},
): () => void {
  const store = useGaesupStore.getState();
  if (options.rememberPrevious !== false && !previousCameraOption) {
    previousCameraOption = cloneCameraOption(store.cameraOption);
  }

  store.setCameraOption(createCameraCloseUpPreset(target, options));
  return restoreCameraCloseUp;
}

export function restoreCameraCloseUp(): void {
  const store = useGaesupStore.getState();
  if (previousCameraOption) {
    store.replaceCameraOption({
      ...cloneCameraOption(previousCameraOption),
      focus: false,
    });
    previousCameraOption = null;
    return;
  }

  store.setCameraOption({ focus: false });
}

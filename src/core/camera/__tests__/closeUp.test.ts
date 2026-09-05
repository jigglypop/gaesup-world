import * as THREE from 'three';

import {
  createCameraCloseUpPreset,
  requestCameraCloseUp,
  restoreCameraCloseUp,
} from '../closeUp';
import { useGaesupStore } from '../../stores/gaesupStore';
import type { CameraOptionType } from '../core/types';

const baseCameraOption: CameraOptionType = {
  focus: false,
  enableFocus: true,
  focusDistance: 12,
  focusLerpSpeed: 3,
  fov: 75,
  enableCollision: true,
  zoom: 1,
  smoothing: { position: 0.2, rotation: 0.2, fov: 0.2 },
};

describe('camera close-up helpers', () => {
  beforeEach(() => {
    useGaesupStore.getState().replaceCameraOption({
      ...baseCameraOption,
      focusTarget: new THREE.Vector3(0, 0, 0),
    });
    restoreCameraCloseUp();
    useGaesupStore.getState().replaceCameraOption({
      ...baseCameraOption,
      focusTarget: new THREE.Vector3(0, 0, 0),
    });
  });

  test('createCameraCloseUpPreset normalizes tuple targets', () => {
    const preset = createCameraCloseUpPreset([1, 2, 3], {
      focusDistance: 5,
      focusLerpSpeed: 9,
      fov: 40,
    });

    expect(preset).toEqual(expect.objectContaining({
      enableFocus: true,
      focus: true,
      focusDistance: 5,
      focusLerpSpeed: 9,
      fov: 40,
      enableCollision: false,
    }));
    expect(preset.focusTarget).toBeInstanceOf(THREE.Vector3);
    expect(preset.focusTarget?.toArray()).toEqual([1, 2, 3]);
  });

  test('requestCameraCloseUp focuses and restoreCameraCloseUp restores previous options', () => {
    const original = useGaesupStore.getState().cameraOption;
    requestCameraCloseUp({ x: 3, y: 4, z: 5 }, { focusDistance: 4, fov: 42 });

    expect(useGaesupStore.getState().cameraOption).toEqual(expect.objectContaining({
      focus: true,
      enableFocus: true,
      focusDistance: 4,
      fov: 42,
    }));
    expect(useGaesupStore.getState().cameraOption.focusTarget?.toArray()).toEqual([3, 4, 5]);

    restoreCameraCloseUp();

    const restored = useGaesupStore.getState().cameraOption;
    expect(restored).toEqual(expect.objectContaining({
      focus: original.focus,
      enableFocus: original.enableFocus,
      focusDistance: original.focusDistance,
      focusLerpSpeed: original.focusLerpSpeed,
      fov: original.fov,
      enableCollision: original.enableCollision,
    }));
    expect(restored.focusTarget).not.toBe(original.focusTarget);
    expect(restored.focusTarget?.toArray()).toEqual([0, 0, 0]);
  });

  test('restoreCameraCloseUp clears focus without a previous snapshot', () => {
    useGaesupStore.getState().setCameraOption({ focus: true });
    restoreCameraCloseUp();

    expect(useGaesupStore.getState().cameraOption.focus).toBe(false);
  });
});

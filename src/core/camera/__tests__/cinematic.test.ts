import * as THREE from 'three';

import { playCameraCinematic } from '../cinematic';
import { restoreCameraCloseUp } from '../closeUp';
import { useGaesupStore } from '../../stores/gaesupStore';
import { useSceneStore } from '../../scene/stores/sceneStore';
import { useCharacterStore } from '../../character/stores/characterStore';
import { getDialogRegistry } from '../../dialog/registry/DialogRegistry';
import { useDialogStore } from '../../dialog/stores/dialogStore';
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

async function flush(): Promise<void> {
  await Promise.resolve();
}

describe('camera cinematic timeline', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    restoreCameraCloseUp();
    useGaesupStore.getState().replaceCameraOption({
      ...baseCameraOption,
      focusTarget: new THREE.Vector3(0, 0, 0),
    });
    useSceneStore.getState().setTransition({ active: false, color: '#000000', progress: 0 });
    useCharacterStore.getState().resetAppearance();
    useDialogStore.getState().close();
    getDialogRegistry().clear();
  });

  afterEach(() => {
    restoreCameraCloseUp();
    useDialogStore.getState().close();
    jest.useRealTimers();
  });

  test('plays close-up beats in order and restores on complete', async () => {
    const playback = playCameraCinematic([
      { kind: 'closeUp', target: [1, 2, 3], durationMs: 100, focusDistance: 4, fov: 42 },
      { kind: 'closeUp', target: [4, 5, 6], durationMs: 100, focusDistance: 5, fov: 46 },
    ]);

    expect(useGaesupStore.getState().cameraOption).toEqual(expect.objectContaining({
      focus: true,
      focusDistance: 4,
      fov: 42,
    }));
    expect(useGaesupStore.getState().cameraOption.focusTarget?.toArray()).toEqual([1, 2, 3]);

    jest.advanceTimersByTime(100);
    await flush();

    expect(useGaesupStore.getState().cameraOption).toEqual(expect.objectContaining({
      focus: true,
      focusDistance: 5,
      fov: 46,
    }));
    expect(useGaesupStore.getState().cameraOption.focusTarget?.toArray()).toEqual([4, 5, 6]);

    jest.advanceTimersByTime(100);
    await playback.finished;

    expect(useGaesupStore.getState().cameraOption).toEqual(expect.objectContaining({
      focus: false,
      focusDistance: 12,
      fov: 75,
    }));
  });

  test('cancel restores the previous camera option', async () => {
    const playback = playCameraCinematic([
      { kind: 'closeUp', target: [2, 3, 4], durationMs: 1000, focusDistance: 3, fov: 38 },
    ]);

    expect(useGaesupStore.getState().cameraOption.focus).toBe(true);
    playback.cancel();

    jest.advanceTimersByTime(1000);
    await playback.finished;

    expect(useGaesupStore.getState().cameraOption).toEqual(expect.objectContaining({
      focus: false,
      focusDistance: 12,
      fov: 75,
    }));
  });

  test('plays dolly and orbit camera action beats', async () => {
    const playback = playCameraCinematic([
      { kind: 'dolly', target: [0, 1, 0], fromDistance: 8, toDistance: 3, durationMs: 100, fov: 40 },
      { kind: 'orbit', target: [1, 2, 3], radius: 5, angleDeg: 90, height: 2, durationMs: 100, fov: 48 },
    ]);

    expect(useGaesupStore.getState().cameraOption).toEqual(expect.objectContaining({
      focus: true,
      focusDistance: 8,
      fov: 40,
    }));

    jest.advanceTimersByTime(16);
    await flush();

    expect(useGaesupStore.getState().cameraOption).toEqual(expect.objectContaining({
      focusDistance: 3,
      fov: 40,
    }));

    jest.advanceTimersByTime(100);
    await flush();

    expect(useGaesupStore.getState().cameraOption).toEqual(expect.objectContaining({
      focusDistance: 5,
      fov: 48,
    }));
    const orbitTarget = useGaesupStore.getState().cameraOption.focusTarget;
    expect(orbitTarget?.x).toBeCloseTo(1);
    expect(orbitTarget?.y).toBeCloseTo(4);
    expect(orbitTarget?.z).toBeCloseTo(8);

    jest.advanceTimersByTime(100);
    await playback.finished;

    expect(useGaesupStore.getState().cameraOption).toEqual(expect.objectContaining({
      focus: false,
      focusDistance: 12,
      fov: 75,
    }));
  });

  test('plays fade and shake action beats', async () => {
    const playback = playCameraCinematic([
      { kind: 'fade', color: '#111111', direction: 'out', durationMs: 100 },
      { kind: 'shake', intensity: 0.2, durationMs: 100 },
    ], { restoreOnComplete: false });

    expect(useSceneStore.getState().transition).toEqual(expect.objectContaining({
      active: true,
      color: '#111111',
      progress: 1,
    }));

    jest.advanceTimersByTime(100);
    await flush();

    expect(useGaesupStore.getState().cameraOption.offset?.toArray()).toEqual([0.2, 0, -0.2]);

    jest.advanceTimersByTime(100);
    await playback.finished;

    expect(useGaesupStore.getState().cameraOption.offset).toBeUndefined();
  });

  test('plays character and dialog gameplay action beats', async () => {
    getDialogRegistry().register({
      id: 'cinematic.test',
      startId: 'start',
      nodes: {
        start: {
          id: 'start',
          speaker: 'Guide',
          text: 'Action.',
          next: null,
        },
      },
    });

    const playback = playCameraCinematic([
      { kind: 'expression', face: 'surprised', durationMs: 20 },
      { kind: 'equip', slot: 'weapon', itemId: 'starter-sword', durationMs: 20 },
      { kind: 'dialog', treeId: 'cinematic.test', context: { npcId: 'guide' }, durationMs: 20 },
    ], { restoreOnComplete: false });

    expect(useCharacterStore.getState().appearance.face).toBe('surprised');

    jest.advanceTimersByTime(20);
    await flush();

    expect(useCharacterStore.getState().outfits.weapon).toBe('starter-sword');

    jest.advanceTimersByTime(20);
    await flush();

    expect(useDialogStore.getState().node?.id).toBe('start');
    expect(useDialogStore.getState().npcId).toBe('guide');

    jest.advanceTimersByTime(20);
    await playback.finished;
  });

  test('bridges teleport animation npc movement and custom events through handlers', async () => {
    const onTeleport = jest.fn();
    const onAnimation = jest.fn();
    const onNpcMove = jest.fn();
    const onEvent = jest.fn();

    const playback = playCameraCinematic([
      { kind: 'teleport', position: [1, 2, 3], durationMs: 10 },
      { kind: 'animation', name: 'wave', durationMs: 10 },
      { kind: 'npcMove', npcId: 'npc-1', position: { x: 4, y: 5, z: 6 }, durationMs: 10 },
      { kind: 'event', name: 'cinematic:done', payload: { ok: true }, durationMs: 10 },
    ], {
      restoreOnComplete: false,
      onTeleport,
      onAnimation,
      onNpcMove,
      onEvent,
    });

    expect(onTeleport).toHaveBeenCalledWith(expect.objectContaining({ x: 1, y: 2, z: 3 }));

    jest.advanceTimersByTime(10);
    await flush();
    expect(onAnimation).toHaveBeenCalledWith('wave');

    jest.advanceTimersByTime(10);
    await flush();
    expect(onNpcMove).toHaveBeenCalledWith('npc-1', expect.objectContaining({ x: 4, y: 5, z: 6 }));

    jest.advanceTimersByTime(10);
    await flush();
    expect(onEvent).toHaveBeenCalledWith('cinematic:done', { ok: true });

    jest.advanceTimersByTime(10);
    await playback.finished;
  });
});

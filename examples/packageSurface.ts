import {
  DEFAULT_CHARACTER_EQUIPMENT_PRESETS,
  applyCharacterEquipmentPreset,
  createCameraCloseUpPreset,
  createCameraPlugin,
  createGaesupRuntime,
  createTeleportDestination,
  playCameraCinematic,
  requestCameraCloseUp,
  restoreCameraCloseUp,
  toggleCharacterWeapon,
} from 'gaesup-world';
import 'gaesup-world/style.css';

export function createPackageSurfaceExample() {
  const runtime = createGaesupRuntime({
    plugins: [createCameraPlugin()],
  });
  const closeUpPreset = createCameraCloseUpPreset([0, 1, 0], {
    focusDistance: 4,
    fov: 44,
  });
  const teleportDestination = createTeleportDestination({
    id: 'package-surface-spawn',
    name: 'Package Surface Spawn',
    position: [0, 0, 0],
  });
  const playback = playCameraCinematic([
    { kind: 'lookAt', target: [0, 1, 0], durationMs: 1, focusDistance: 4 },
    { kind: 'dolly', target: [0, 1, 2], toDistance: 3, durationMs: 1 },
    { kind: 'orbit', target: [0, 1, 0], radius: 5, angleDeg: 45, durationMs: 1 },
    { kind: 'shake', intensity: 0.1, durationMs: 1 },
    { kind: 'fade', direction: 'inOut', durationMs: 1 },
    { kind: 'expression', face: 'wink', durationMs: 1 },
    { kind: 'equip', slot: 'weapon', itemId: 'starter-weapon-layer', durationMs: 1 },
    { kind: 'teleport', position: [0, 0, 1], durationMs: 1 },
    { kind: 'animation', name: 'wave', durationMs: 1 },
    { kind: 'npcMove', npcId: 'package-npc', position: [1, 0, 1], durationMs: 1 },
    { kind: 'event', name: 'package:event', payload: { ok: true }, durationMs: 1 },
  ], {
    restoreOnComplete: false,
  });
  playback.cancel();
  restoreCameraCloseUp();

  void runtime;
  void closeUpPreset;
  void teleportDestination;
  void playback;
  void requestCameraCloseUp;
  void toggleCharacterWeapon;
  void applyCharacterEquipmentPreset;
  void DEFAULT_CHARACTER_EQUIPMENT_PRESETS;

  return {
    runtime,
    closeUpPreset,
    teleportDestination,
    playback,
  };
}

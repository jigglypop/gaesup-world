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
import type * as GaesupAdminSurface from 'gaesup-world/admin';
import type * as GaesupAssetsSurface from 'gaesup-world/assets';
import type * as GaesupBlueprintsSurface from 'gaesup-world/blueprints';
import type * as GaesupBlueprintsEditorSurface from 'gaesup-world/blueprints/editor';
import type * as GaesupBuildingSurface from 'gaesup-world/building';
import type * as GaesupEditorSurface from 'gaesup-world/editor';
import type * as GaesupGameplaySurface from 'gaesup-world/gameplay';
import type * as GaesupNavigationSurface from 'gaesup-world/navigation';
import type * as GaesupNetworkSurface from 'gaesup-world/network';
import type * as GaesupNextSurface from 'gaesup-world/next';
import type * as GaesupPluginsSurface from 'gaesup-world/plugins';
import type * as GaesupPostprocessingSurface from 'gaesup-world/postprocessing';
import type * as GaesupRuntimeSurface from 'gaesup-world/runtime';
import type * as GaesupServerContractsSurface from 'gaesup-world/server-contracts';
import 'gaesup-world/style.css';

export type PackageSurfaceSubpathModules = {
  admin: typeof GaesupAdminSurface;
  assets: typeof GaesupAssetsSurface;
  blueprints: typeof GaesupBlueprintsSurface;
  blueprintsEditor: typeof GaesupBlueprintsEditorSurface;
  building: typeof GaesupBuildingSurface;
  editor: typeof GaesupEditorSurface;
  gameplay: typeof GaesupGameplaySurface;
  navigation: typeof GaesupNavigationSurface;
  network: typeof GaesupNetworkSurface;
  next: typeof GaesupNextSurface;
  plugins: typeof GaesupPluginsSurface;
  postprocessing: typeof GaesupPostprocessingSurface;
  runtime: typeof GaesupRuntimeSurface;
  serverContracts: typeof GaesupServerContractsSurface;
};

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
  const startCinematic = () =>
    playCameraCinematic(
      [
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
      ],
      {
        restoreOnComplete: false,
      },
    );

  void runtime;
  void closeUpPreset;
  void teleportDestination;
  void requestCameraCloseUp;
  void restoreCameraCloseUp;
  void toggleCharacterWeapon;
  void applyCharacterEquipmentPreset;
  void DEFAULT_CHARACTER_EQUIPMENT_PRESETS;

  return {
    runtime,
    closeUpPreset,
    teleportDestination,
    startCinematic,
  };
}

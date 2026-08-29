import * as THREE from 'three';

import { applyCharacterEquipmentPreset } from '../character/actionEquipment';
import { useCharacterStore } from '../character/stores/characterStore';
import { useDialogStore } from '../dialog/stores/dialogStore';
import type { DialogContext, DialogTreeId } from '../dialog/types';
import { useSceneStore } from '../scene/stores/sceneStore';
import { useGaesupStore } from '../stores/gaesupStore';
import { requestCameraCloseUp, restoreCameraCloseUp, type CameraCloseUpOptions, type CameraCloseUpTarget } from './closeUp';

export type CameraCinematicBeat =
  | ({ kind: 'closeUp' | 'lookAt'; target: CameraCloseUpTarget; durationMs?: number } & CameraCloseUpOptions)
  | ({ kind: 'dolly'; target: CameraCloseUpTarget; fromDistance?: number; toDistance?: number; durationMs?: number } & Omit<CameraCloseUpOptions, 'focusDistance'>)
  | ({ kind: 'orbit'; target: CameraCloseUpTarget; radius: number; angleDeg?: number; height?: number; durationMs?: number } & Omit<CameraCloseUpOptions, 'focusDistance'>)
  | { kind: 'shake'; intensity?: number; durationMs?: number }
  | { kind: 'fade'; color?: string; direction?: 'in' | 'out' | 'inOut'; durationMs?: number }
  | { kind: 'expression'; face: string; durationMs?: number }
  | { kind: 'equip'; slot?: string; itemId: string; durationMs?: number }
  | { kind: 'dialog'; treeId: DialogTreeId; context?: DialogContext; durationMs?: number }
  | { kind: 'teleport'; position: CameraCloseUpTarget; durationMs?: number }
  | { kind: 'animation'; name: string; durationMs?: number }
  | { kind: 'npcMove'; npcId: string; position: CameraCloseUpTarget; durationMs?: number }
  | { kind: 'event'; name: string; payload?: unknown; durationMs?: number }
  | { kind: 'restore'; durationMs?: number };

export type CameraCinematicOptions = {
  restoreOnComplete?: boolean;
  onTeleport?: (position: CameraCloseUpTarget) => void;
  onAnimation?: (name: string) => void;
  onNpcMove?: (npcId: string, position: CameraCloseUpTarget) => void;
  onEvent?: (name: string, payload?: unknown) => void;
};

export type CameraCinematicPlayback = {
  finished: Promise<void>;
  cancel: () => void;
};

const delay = (ms = 0) => new Promise<void>((resolve) => {
  window.setTimeout(resolve, Math.max(0, ms));
});

function toVector3(target: CameraCloseUpTarget): THREE.Vector3 {
  if (target instanceof THREE.Vector3) return target.clone();
  if (Array.isArray(target)) return new THREE.Vector3(target[0], target[1], target[2]);
  return new THREE.Vector3(target.x, target.y, target.z);
}

export function playCameraCinematic(
  beats: CameraCinematicBeat[],
  options: CameraCinematicOptions = {},
): CameraCinematicPlayback {
  let cancelled = false;

  const finished = (async () => {
    for (const beat of beats) {
      if (cancelled) return;

      switch (beat.kind) {
        case 'closeUp':
        case 'lookAt':
          requestCameraCloseUp(beat.target, beat);
          break;
        case 'dolly':
          requestCameraCloseUp(beat.target, {
            ...beat,
            ...((beat.fromDistance ?? beat.toDistance) !== undefined
              ? { focusDistance: beat.fromDistance ?? beat.toDistance }
              : {}),
          });
          if (beat.fromDistance !== undefined && beat.toDistance !== undefined) {
            await delay(16);
            if (cancelled) return;
            requestCameraCloseUp(beat.target, {
              ...beat,
              focusDistance: beat.toDistance,
            });
            await delay(Math.max(0, (beat.durationMs ?? 0) - 16));
            continue;
          }
          break;
        case 'orbit':
          {
            const target = toVector3(beat.target);
            target.y += beat.height ?? 0;
            target.z += beat.radius;
            requestCameraCloseUp(target, { ...beat, focusDistance: beat.radius });
          }
          break;
        case 'expression':
          useCharacterStore.getState().setFace(beat.face as never);
          break;
        case 'equip':
          applyCharacterEquipmentPreset({
            id: 'cinematic-equip',
            label: 'Cinematic Equip',
            outfits: { [beat.slot ?? 'weapon']: beat.itemId } as never,
          });
          break;
        case 'dialog':
          useDialogStore.getState().start(beat.treeId, {
            ...(beat.context ? { context: beat.context } : {}),
          });
          break;
        case 'teleport':
          options.onTeleport?.(toVector3(beat.position));
          break;
        case 'animation':
          options.onAnimation?.(beat.name);
          break;
        case 'npcMove':
          options.onNpcMove?.(beat.npcId, toVector3(beat.position));
          break;
        case 'event':
          options.onEvent?.(beat.name, beat.payload);
          break;
        case 'restore':
          restoreCameraCloseUp();
          break;
        case 'fade':
          useSceneStore.getState().setTransition({
            active: true,
            color: beat.color ?? '#000000',
            progress: beat.direction === 'in' ? 0 : 1,
          });
          break;
        case 'shake':
          {
            const intensity = beat.intensity ?? 0.08;
            useGaesupStore.getState().setCameraOption({
              offset: new THREE.Vector3(intensity, 0, -intensity),
            });
          }
          break;
        default:
          {
            const exhaustive: never = beat;
            return exhaustive;
          }
      }

      await delay('durationMs' in beat ? beat.durationMs : 0);
      if (!cancelled && beat.kind === 'shake') {
        const cameraOption = { ...useGaesupStore.getState().cameraOption };
        delete cameraOption.offset;
        useGaesupStore.getState().replaceCameraOption(cameraOption);
      }
    }

    if (!cancelled && options.restoreOnComplete !== false) {
      restoreCameraCloseUp();
    }
  })();

  return {
    finished,
    cancel: () => {
      cancelled = true;
      restoreCameraCloseUp();
    },
  };
}

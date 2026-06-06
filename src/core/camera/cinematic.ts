import { applyCharacterEquipmentPreset } from '../character/actionEquipment';
import { useCharacterStore } from '../character/stores/characterStore';
import { requestCameraCloseUp, restoreCameraCloseUp, type CameraCloseUpOptions, type CameraCloseUpTarget } from './closeUp';

export type CameraCinematicBeat =
  | ({ kind: 'closeUp' | 'lookAt'; target: CameraCloseUpTarget; durationMs?: number } & CameraCloseUpOptions)
  | ({ kind: 'dolly'; target: CameraCloseUpTarget; fromDistance?: number; toDistance?: number; durationMs?: number } & Omit<CameraCloseUpOptions, 'focusDistance'>)
  | ({ kind: 'orbit'; target: CameraCloseUpTarget; radius: number; angleDeg?: number; height?: number; durationMs?: number } & Omit<CameraCloseUpOptions, 'focusDistance'>)
  | { kind: 'shake'; intensity?: number; durationMs?: number }
  | { kind: 'fade'; direction?: 'in' | 'out' | 'inOut'; durationMs?: number }
  | { kind: 'expression'; face: string; durationMs?: number }
  | { kind: 'equip'; slot?: string; itemId: string; durationMs?: number }
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
            ...((beat.toDistance ?? beat.fromDistance) !== undefined
              ? { focusDistance: beat.toDistance ?? beat.fromDistance }
              : {}),
          });
          break;
        case 'orbit':
          requestCameraCloseUp(beat.target, { ...beat, focusDistance: beat.radius });
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
        case 'teleport':
          options.onTeleport?.(beat.position);
          break;
        case 'animation':
          options.onAnimation?.(beat.name);
          break;
        case 'npcMove':
          options.onNpcMove?.(beat.npcId, beat.position);
          break;
        case 'event':
          options.onEvent?.(beat.name, beat.payload);
          break;
        case 'restore':
          restoreCameraCloseUp();
          break;
        case 'fade':
        case 'shake':
          break;
      }

      await delay('durationMs' in beat ? beat.durationMs : 0);
    }

    if (!cancelled && options.restoreOnComplete !== false) {
      restoreCameraCloseUp();
    }
  })();

  return {
    finished,
    cancel: () => {
      cancelled = true;
    },
  };
}

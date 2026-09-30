import * as THREE from 'three';

import { cloneCameraOption, createCameraCloseUpPreset, type CameraCloseUpOptions, type CameraCloseUpTarget } from './closeUp';
import type { CameraOptionType } from './core/types';
import { applyCharacterEquipmentPreset } from '../character/actionEquipment';
import { useCharacterStore, type CharacterStore } from '../character/stores/characterStore';
import { useDialogStore, type DialogStore } from '../dialog/stores/dialogStore';
import type { DialogContext, DialogTreeId } from '../dialog/types';
import { useSceneStore, type SceneStore } from '../scene/stores/sceneStore';
import { useGaesupStore, type GaesupStore } from '../stores/gaesupStore';

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
  store?: GaesupStore;
  dialogStore?: DialogStore;
  characterStore?: CharacterStore;
  sceneStore?: SceneStore;
  restoreOnComplete?: boolean;
  signal?: AbortSignal;
  onTeleport?: (position: CameraCloseUpTarget) => void;
  onAnimation?: (name: string) => void;
  onNpcMove?: (npcId: string, position: CameraCloseUpTarget) => void;
  onEvent?: (name: string, payload?: unknown) => void;
};

export type CameraCinematicPlayback = {
  finished: Promise<void>;
  cancel: () => void;
  readonly state: 'playing' | 'completed' | 'cancelled' | 'failed';
};

function toVector3(target: CameraCloseUpTarget): THREE.Vector3 {
  if (target instanceof THREE.Vector3) return target.clone();
  if (Array.isArray(target)) return new THREE.Vector3(target[0], target[1], target[2]);
  return new THREE.Vector3(target.x, target.y, target.z);
}

export type CameraCinematicPlayer = {
  play: (beats: CameraCinematicBeat[], options?: CameraCinematicOptions) => CameraCinematicPlayback;
  cancel: () => void;
  suspend: () => void;
  resume: () => void;
  getStats: () => { active: boolean; playing: boolean; pendingTimers: number; started: number; completed: number; cancelled: number; failed: number };
};

const players = new WeakMap<GaesupStore, CameraCinematicPlayer>();

/** One timeline authority per camera store; world runtimes supply all domain ports. */
export function createCameraCinematicPlayer(defaults: CameraCinematicOptions = {}, active = true): CameraCinematicPlayer {
  const store = defaults.store ?? useGaesupStore;
  const existing = players.get(store); if (existing) return existing;
  let enabled = active; let generation = 0; let current: CameraCinematicPlayback | undefined;
  let pendingTimers = 0; let started = 0; let completed = 0; let cancelled = 0; let failed = 0;
  const player: CameraCinematicPlayer = {
    play: (input, overrides = {}) => {
      const options = { ...defaults, ...overrides, store };
      if (!enabled || options.signal?.aborted) {
        cancelled++;
        return { finished: Promise.resolve(), cancel: () => {}, state: 'cancelled' };
      }
      const ticket = ++generation;
      current?.cancel();
      const scene = options.sceneStore ?? useSceneStore;
      const character = options.characterStore ?? useCharacterStore;
      const dialog = options.dialogStore ?? useDialogStore;
      // Snapshot mutable target vectors and beat options before asynchronous execution.
      const beats = input.map(beat => ({ ...beat,
        ...('target' in beat ? { target: toVector3(beat.target) } : {}),
        ...('position' in beat ? { position: toVector3(beat.position) } : {}),
      })) as CameraCinematicBeat[];
      let state: CameraCinematicPlayback['state'] = 'playing';
      let resolve: () => void = () => {}; let reject: (error: unknown) => void = () => {};
      const finished = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
      // Fire-and-forget callers remain safe; awaiting the original promise still receives failures.
      void finished.catch(() => {});
      let releaseWait: (() => void) | undefined;
      let previousCamera: CameraOptionType | undefined;
      let lastCamera: CameraOptionType | undefined;
      let previousTransition: ReturnType<SceneStore['getState']>['transition'] | undefined;
      let lastTransition: ReturnType<SceneStore['getState']>['transition'] | undefined;
      let shake: { offset?: THREE.Vector3 } | undefined;
      const valid = () => state === 'playing' && enabled && current === playback && generation === ticket;
      const writeCamera = (patch: Partial<CameraOptionType>, remember = true) => {
        if (!valid()) return;
        if (remember && !previousCamera) previousCamera = cloneCameraOption(store.getState().cameraOption);
        lastCamera = { ...store.getState().cameraOption, ...patch };
        store.getState().replaceCameraOption(lastCamera);
      };
      const closeUp = (target: CameraCloseUpTarget, preset: CameraCloseUpOptions) => writeCamera(createCameraCloseUpPreset(target, preset), preset.rememberPrevious !== false);
      const restoreCamera = () => {
        const previous = previousCamera; const last = lastCamera;
        previousCamera = undefined; lastCamera = undefined;
        if (!last || store.getState().cameraOption !== last) return;
        if (previous) store.getState().replaceCameraOption(cloneCameraOption(previous));
        else store.getState().setCameraOption({ focus: false });
      };
      const restoreShake = () => {
        const previous = shake; shake = undefined;
        if (!previous || !lastCamera || store.getState().cameraOption !== lastCamera) return;
        const next = { ...store.getState().cameraOption };
        if (previous.offset) next.offset = previous.offset.clone(); else delete next.offset;
        lastCamera = next;
        store.getState().replaceCameraOption(next);
      };
      const restoreFade = () => {
        const previous = previousTransition; const last = lastTransition;
        previousTransition = undefined; lastTransition = undefined;
        if (previous && last && scene.getState().transition === last) scene.getState().setTransition(previous);
      };
      const finish = (result: Exclude<CameraCinematicPlayback['state'], 'playing'>, error?: unknown) => {
        if (state !== 'playing') return;
        state = result;
        if (current === playback) current = undefined;
        options.signal?.removeEventListener('abort', abort);
        let failure = error; let hasFailure = result === 'failed';
        for (const cleanup of [() => releaseWait?.(), restoreShake, restoreFade, () => { if (result !== 'completed' || options.restoreOnComplete !== false) restoreCamera(); }]) {
          try { cleanup(); } catch (cause) { if (!hasFailure) failure = cause; hasFailure = true; }
        }
        if (hasFailure) { state = 'failed'; failed++; reject(failure); }
        else { if (state === 'completed') completed++; else cancelled++; resolve(); }
      };
      const abort = () => finish('cancelled');
      const playback: CameraCinematicPlayback = { finished, cancel: abort, get state() { return state; } };
      const delay = (duration = 0) => {
        if (!valid()) return Promise.resolve();
        return new Promise<void>(done => {
          let settled = false;
          const finishWait = () => {
            if (settled) return; settled = true; clearTimeout(timer); pendingTimers--;
            if (releaseWait === finishWait) releaseWait = undefined; done();
          };
          const timer = setTimeout(finishWait, Number.isFinite(duration) ? Math.max(0, duration) : 0);
          pendingTimers++; releaseWait = finishWait;
        });
      };
      const execute = async () => {
        for (const beat of beats) {
          if (!valid()) return;
          switch (beat.kind) {
            case 'closeUp': case 'lookAt': closeUp(beat.target, beat); break;
            case 'dolly':
              closeUp(beat.target, { ...beat, ...((beat.fromDistance ?? beat.toDistance) !== undefined ? { focusDistance: beat.fromDistance ?? beat.toDistance } : {}) });
              if (beat.fromDistance !== undefined && beat.toDistance !== undefined) {
                await delay(16); if (!valid()) return;
                closeUp(beat.target, { ...beat, focusDistance: beat.toDistance });
                await delay(Math.max(0, (beat.durationMs ?? 0) - 16)); continue;
              }
              break;
            case 'orbit': {
              const target = toVector3(beat.target); target.y += beat.height ?? 0; target.z += beat.radius;
              closeUp(target, { ...beat, focusDistance: beat.radius }); break;
            }
            case 'expression': character.getState().setFace(beat.face as never); break;
            case 'equip': applyCharacterEquipmentPreset({ id: 'cinematic-equip', label: 'Cinematic Equip', outfits: { [beat.slot ?? 'weapon']: beat.itemId } as never }, character); break;
            case 'dialog': dialog.getState().start(beat.treeId, { ...(beat.context ? { context: beat.context } : {}) }); break;
            case 'teleport': options.onTeleport?.(toVector3(beat.position)); break;
            case 'animation': options.onAnimation?.(beat.name); break;
            case 'npcMove': options.onNpcMove?.(beat.npcId, toVector3(beat.position)); break;
            case 'event': options.onEvent?.(beat.name, beat.payload); break;
            case 'restore': restoreCamera(); break;
            case 'fade':
              previousTransition ??= { ...scene.getState().transition };
              lastTransition = { ...scene.getState().transition, active: true, color: beat.color ?? '#000000', progress: beat.direction === 'in' ? 0 : 1 };
              scene.setState({ transition: lastTransition });
              break;
            case 'shake': {
              const offset = store.getState().cameraOption.offset;
              shake = offset ? { offset: offset.clone() } : {};
              const intensity = beat.intensity ?? 0.08;
              writeCamera({ offset: new THREE.Vector3(intensity, 0, -intensity) }); break;
            }
            default: { const exhaustive: never = beat; return exhaustive; }
          }
          await delay(beat.durationMs);
          if (valid() && beat.kind === 'shake') restoreShake();
        }
      };
      if (!enabled || options.signal?.aborted || ticket !== generation) { finish('cancelled'); return playback; }
      current = playback; started++;
      options.signal?.addEventListener('abort', abort, { once: true });
      void execute().then(() => finish('completed'), error => finish('failed', error));
      return playback;
    },
    cancel: () => current?.cancel(),
    suspend: () => { enabled = false; generation++; current?.cancel(); },
    resume: () => { enabled = true; },
    getStats: () => ({ active: enabled, playing: !!current, pendingTimers, started, completed, cancelled, failed }),
  };
  players.set(store, player);
  return player;
}

export function playCameraCinematic(beats: CameraCinematicBeat[], options: CameraCinematicOptions = {}): CameraCinematicPlayback {
  return createCameraCinematicPlayer({ store: options.store ?? useGaesupStore }).play(beats, options);
}

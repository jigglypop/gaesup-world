import * as THREE from 'three';

import type { GaesupPlugin, PluginContext } from '../plugins';
import { createIdentityRevision } from '../save/core/revision';
import { useGaesupStore, RUNTIME_GAESUP_STORE_SERVICE_ID, type GaesupStore } from '../stores/gaesupStore';
import type { CameraSystemConfig } from './bridge/types';
import { CameraSystem } from './core/CameraSystem';
import type { CameraCollisionTargets, CameraOptionType } from './core/types';
import type { ModeState } from '../stores/slices/mode';

type SerializedVector3 = {
  x: number;
  y: number;
  z: number;
};

type SerializedEuler = SerializedVector3 & {
  order: THREE.EulerOrder;
};

export type CameraSerializedOptionValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | SerializedVector3
  | SerializedEuler
  | CameraSerializedOptionValue[]
  | { [key: string]: CameraSerializedOptionValue };

export interface CameraSerializedState {
  mode: ModeState;
  cameraOption: { [key: string]: CameraSerializedOptionValue };
}

export interface CameraSystemExtension {
  System: typeof CameraSystem;
  create: (config: CameraSystemConfig) => CameraSystem;
}

export interface CameraSaveExtension {
  key: string;
  serialize: () => CameraSerializedState;
  hydrate: (data: CameraSerializedState | null | undefined) => void;
  prepareHydrate?: (data: CameraSerializedState | null | undefined) => () => void;
}

export interface CameraStoreService {
  useStore: typeof useGaesupStore;
  getState: () => CameraSerializedState;
  setMode: (update: Partial<ModeState>) => void;
  setCameraOption: (update: Partial<CameraOptionType>) => void;
}

export interface CameraPluginOptions {
  id?: string;
  systemExtensionId?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.camera';
export const DEFAULT_CAMERA_SYSTEM_EXTENSION_ID = 'camera.system';
export const DEFAULT_CAMERA_SAVE_EXTENSION_ID = 'camera';
export const DEFAULT_CAMERA_STORE_SERVICE_ID = 'camera.store';
const COLLISION_TARGETS: ReadonlySet<unknown> = new Set<CameraCollisionTargets>(['scene', 'colliders']);
const VECTOR_OPTION_KEYS = new Set(['focusTarget', 'fixedPosition']);
/**
 * Never saved or restored: the transient shake `offset` (older saves hold a meaningless (-10, -10, -10) default that
 * would now move the camera) and the options removed because nothing read them.
 */
const UNSAVED_OPTION_KEYS = new Set([
  'offset', 'maxDistance', 'distance', 'target', 'position', 'focusDuration',
  'minFov', 'maxFov', 'mode', 'rotation', 'isoAngle', 'modeSettings',
]);

declare module '../plugins' {
  interface SystemExtensionMap {
    'camera.system': CameraSystemExtension;
  }

  interface SaveExtensionMap {
    camera: CameraSaveExtension;
  }

  interface ServiceExtensionMap {
    'camera.store': CameraStoreService;
  }
}

function serializeValue(value: unknown): CameraSerializedOptionValue {
  if (value instanceof THREE.Vector3) {
    return { x: value.x, y: value.y, z: value.z };
  }

  if (value instanceof THREE.Euler) {
    return { x: value.x, y: value.y, z: value.z, order: value.order };
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serializeValue(entry)]),
    );
  }

  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  return undefined;
}

function isSerializedVector3(value: unknown): value is SerializedVector3 {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SerializedVector3>;
  return (
    Number.isFinite(candidate.x) &&
    Number.isFinite(candidate.y) &&
    Number.isFinite(candidate.z)
  );
}

function deserializeCameraOption(
  option: CameraSerializedState['cameraOption'],
): Partial<CameraOptionType> {
  const next: Partial<CameraOptionType> = {};

  for (const [key, value] of Object.entries(option)) {
    if (value === undefined || UNSAVED_OPTION_KEYS.has(key)) continue;
    if (VECTOR_OPTION_KEYS.has(key) && !isSerializedVector3(value)) throw new TypeError('Invalid camera vector');
    if (VECTOR_OPTION_KEYS.has(key) && isSerializedVector3(value)) {
      Object.assign(next, { [key]: new THREE.Vector3(value.x, value.y, value.z) });
      continue;
    }

    Object.assign(next, { [key]: serializeValue(value) });
  }

  return next;
}

function getCameraSerializedState(store: GaesupStore = useGaesupStore): CameraSerializedState {
  const state = store.getState();
  return {
    mode: { ...state.mode },
    cameraOption: serializeValue(
      Object.fromEntries(Object.entries(state.cameraOption).filter(([key]) => !UNSAVED_OPTION_KEYS.has(key))),
    ) as CameraSerializedState['cameraOption'],
  };
}

function validateNumericOptions(value: CameraSerializedOptionValue): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Invalid camera numeric options');
  for (const entry of Object.values(value)) {
    if (entry === undefined) continue;
    if (entry && typeof entry === 'object') validateNumericOptions(entry);
    else if (typeof entry !== 'number' || !Number.isFinite(entry)) throw new TypeError('Invalid camera numeric option');
  }
}

function prepareCameraState(data: CameraSerializedState | null | undefined, store: GaesupStore = useGaesupStore): () => void {
  if (data === null || data === undefined) return () => {};
  if (typeof data !== 'object' || Array.isArray(data)
    || (data.mode !== undefined && (!data.mode || typeof data.mode !== 'object' || Array.isArray(data.mode)))
    || (data.cameraOption !== undefined && (!data.cameraOption || typeof data.cameraOption !== 'object' || Array.isArray(data.cameraOption)))) {
    throw new TypeError('Invalid camera snapshot');
  }
  const mode = data.mode ? { ...data.mode } : undefined;
  if (mode && ((mode.type !== undefined && !['character', 'vehicle', 'airplane'].includes(mode.type))
    || (mode.controller !== undefined && !['keyboard', 'clicker', 'gamepad'].includes(mode.controller))
    || (mode.control !== undefined && !['thirdPerson', 'firstPerson', 'topDown', 'sideScroll', 'isometric', 'fixed', 'chase'].includes(mode.control)))) {
    throw new TypeError('Invalid camera mode');
  }
  const raw = data.cameraOption;
  if (raw) {
    for (const key of ['maxDistance', 'distance', 'xDistance', 'yDistance', 'zDistance', 'zoom', 'zoomSpeed', 'minZoom', 'maxZoom',
      'focusDuration', 'focusDistance', 'focusLerpSpeed', 'collisionMargin', 'fov', 'minFov', 'maxFov', 'isoAngle']) {
      if (raw[key] !== undefined && (typeof raw[key] !== 'number' || !Number.isFinite(raw[key]))) throw new TypeError('Invalid camera number');
    }
    for (const key of ['enableZoom', 'focus', 'enableFocus', 'enableCollision']) {
      if (raw[key] !== undefined && typeof raw[key] !== 'boolean') throw new TypeError('Invalid camera boolean');
    }
    for (const key of ['smoothing', 'bounds', 'modeSettings']) {
      if (raw[key] !== undefined) validateNumericOptions(raw[key]);
    }
    if (raw['mode'] !== undefined && typeof raw['mode'] !== 'string') throw new TypeError('Invalid camera option mode');
    if (raw['collisionTargets'] !== undefined && !COLLISION_TARGETS.has(raw['collisionTargets'])) {
      throw new TypeError('Invalid camera collision targets');
    }
  }
  const option = raw ? deserializeCameraOption(raw) : undefined;
  return () => {
    const state = store.getState();
    if (mode) state.setMode(mode);
    if (option) state.setCameraOption(option);
  };
}

/** Only the camera fields go back to construction; the rest of the runtime store belongs to other domains. */
function resetCameraState(store: GaesupStore): void {
  const { mode, cameraOption } = store.getInitialState();
  // The hydrate round trip gives the reset its own vectors; a full option comes back full.
  const option = deserializeCameraOption(serializeValue(cameraOption) as CameraSerializedState['cameraOption']) as CameraOptionType;
  store.setState({ mode: { ...mode }, cameraOption: option });
}

function hydrateCameraState(data: CameraSerializedState | null | undefined, store: GaesupStore = useGaesupStore): void {
  prepareCameraState(data, store)();
}

export function createCameraPlugin(options: CameraPluginOptions = {}): GaesupPlugin {
  const pluginId = options.id ?? DEFAULT_PLUGIN_ID;
  const systemExtensionId = options.systemExtensionId ?? DEFAULT_CAMERA_SYSTEM_EXTENSION_ID;
  const saveExtensionId = options.saveExtensionId ?? DEFAULT_CAMERA_SAVE_EXTENSION_ID;
  const storeServiceId = options.storeServiceId ?? DEFAULT_CAMERA_STORE_SERVICE_ID;

  return {
    id: pluginId,
    name: 'GaeSup Camera',
    version: '0.1.0',
    runtime: 'client',
    capabilities: ['camera'],
    setup(ctx: PluginContext) {
      const store = ctx.services.get<GaesupStore>(RUNTIME_GAESUP_STORE_SERVICE_ID) ?? useGaesupStore;
      ctx.systems.register(systemExtensionId, {
        System: CameraSystem,
        create: (config: CameraSystemConfig) => new CameraSystem(config),
      }, pluginId);
      ctx.save.register(saveExtensionId, {
        key: saveExtensionId,
        serialize: () => getCameraSerializedState(store),
        hydrate: (data: CameraSerializedState | null | undefined) => hydrateCameraState(data, store),
        prepareHydrate: (data: CameraSerializedState | null | undefined) => prepareCameraState(data, store),
        revision: createIdentityRevision(() => [store.getState().mode, store.getState().cameraOption]),
        reset: () => resetCameraState(store),
      }, pluginId);
      ctx.services.register(storeServiceId, {
        useStore: store,
        getState: () => getCameraSerializedState(store),
        setMode: (update: Partial<ModeState>) => store.getState().setMode(update),
        setCameraOption: (update: Partial<CameraOptionType>) => store.getState().setCameraOption(update),
      }, pluginId);
      ctx.events.emit('camera:ready', {
        pluginId,
        systemExtensionId,
        saveExtensionId,
        storeServiceId,
      });
    },
    dispose(ctx: PluginContext) {
      ctx.systems.remove(systemExtensionId);
      ctx.save.remove(saveExtensionId);
      ctx.services.remove(storeServiceId);
    },
  };
}

export const cameraPlugin = createCameraPlugin();

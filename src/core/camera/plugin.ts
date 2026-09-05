import * as THREE from 'three';

import type { GaesupPlugin, PluginContext } from '../plugins';
import { useGaesupStore } from '../stores/gaesupStore';
import type { CameraSystemConfig } from './bridge/types';
import { CameraSystem } from './core/CameraSystem';
import type { CameraOptionType } from './core/types';
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
const VECTOR_OPTION_KEYS = new Set([
  'offset',
  'target',
  'position',
  'focusTarget',
  'fixedPosition',
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

function isSerializedEuler(value: unknown): value is SerializedEuler {
  if (!isSerializedVector3(value)) return false;
  return ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'].includes((value as Partial<SerializedEuler>).order ?? '');
}

function deserializeCameraOption(
  option: CameraSerializedState['cameraOption'],
): Partial<CameraOptionType> {
  const next: Partial<CameraOptionType> = {};

  for (const [key, value] of Object.entries(option)) {
    if (value === undefined) continue;
    if (VECTOR_OPTION_KEYS.has(key) && !isSerializedVector3(value)) throw new TypeError('Invalid camera vector');
    if (key === 'rotation' && !isSerializedEuler(value)) throw new TypeError('Invalid camera rotation');
    if (VECTOR_OPTION_KEYS.has(key) && isSerializedVector3(value)) {
      Object.assign(next, { [key]: new THREE.Vector3(value.x, value.y, value.z) });
      continue;
    }

    if (key === 'rotation' && isSerializedEuler(value)) {
      Object.assign(next, { rotation: new THREE.Euler(value.x, value.y, value.z, value.order) });
      continue;
    }

    Object.assign(next, { [key]: serializeValue(value) });
  }

  return next;
}

function getCameraSerializedState(): CameraSerializedState {
  const state = useGaesupStore.getState();
  return {
    mode: { ...state.mode },
    cameraOption: serializeValue(state.cameraOption) as CameraSerializedState['cameraOption'],
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

function prepareCameraState(data: CameraSerializedState | null | undefined): () => void {
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
  }
  const option = raw ? deserializeCameraOption(raw) : undefined;
  return () => {
    const state = useGaesupStore.getState();
    if (mode) state.setMode(mode);
    if (option) state.setCameraOption(option);
  };
}

function hydrateCameraState(data: CameraSerializedState | null | undefined): void {
  prepareCameraState(data)();
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
      ctx.systems.register(systemExtensionId, {
        System: CameraSystem,
        create: (config: CameraSystemConfig) => new CameraSystem(config),
      }, pluginId);
      ctx.save.register(saveExtensionId, {
        key: saveExtensionId,
        serialize: getCameraSerializedState,
        hydrate: hydrateCameraState,
        prepareHydrate: prepareCameraState,
      }, pluginId);
      ctx.services.register(storeServiceId, {
        useStore: useGaesupStore,
        getState: getCameraSerializedState,
        setMode: (update: Partial<ModeState>) => useGaesupStore.getState().setMode(update),
        setCameraOption: (update: Partial<CameraOptionType>) => useGaesupStore.getState().setCameraOption(update),
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

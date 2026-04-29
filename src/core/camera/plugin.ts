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
const DEFAULT_SYSTEM_EXTENSION_ID = 'camera.system';
const DEFAULT_SAVE_EXTENSION_ID = 'camera';
const DEFAULT_STORE_SERVICE_ID = 'camera.store';
const VECTOR_OPTION_KEYS = new Set([
  'offset',
  'target',
  'position',
  'focusTarget',
  'fixedPosition',
]);

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
    typeof candidate.x === 'number' &&
    typeof candidate.y === 'number' &&
    typeof candidate.z === 'number'
  );
}

function isSerializedEuler(value: unknown): value is SerializedEuler {
  if (!isSerializedVector3(value)) return false;
  return typeof (value as Partial<SerializedEuler>).order === 'string';
}

function deserializeCameraOption(
  option: CameraSerializedState['cameraOption'],
): Partial<CameraOptionType> {
  const next: Partial<CameraOptionType> = {};

  for (const [key, value] of Object.entries(option)) {
    if (VECTOR_OPTION_KEYS.has(key) && isSerializedVector3(value)) {
      Object.assign(next, { [key]: new THREE.Vector3(value.x, value.y, value.z) });
      continue;
    }

    if (key === 'rotation' && isSerializedEuler(value)) {
      Object.assign(next, { rotation: new THREE.Euler(value.x, value.y, value.z, value.order) });
      continue;
    }

    Object.assign(next, { [key]: value });
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

function hydrateCameraState(data: CameraSerializedState | null | undefined): void {
  if (!data || typeof data !== 'object') return;

  const state = useGaesupStore.getState();
  if (data.mode && typeof data.mode === 'object') {
    state.setMode(data.mode);
  }

  if (data.cameraOption && typeof data.cameraOption === 'object') {
    state.setCameraOption(deserializeCameraOption(data.cameraOption));
  }
}

export function createCameraPlugin(options: CameraPluginOptions = {}): GaesupPlugin {
  const pluginId = options.id ?? DEFAULT_PLUGIN_ID;
  const systemExtensionId = options.systemExtensionId ?? DEFAULT_SYSTEM_EXTENSION_ID;
  const saveExtensionId = options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID;
  const storeServiceId = options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID;

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

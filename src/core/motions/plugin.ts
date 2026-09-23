import { isWorldInputSourceOwned } from '../input/WorldInputBackend';
import {
  createInteractionInputAdapter,
  DEFAULT_INTERACTION_INPUT_EXTENSION_ID,
} from '../interactions/core';
import type { InputAdapter, InputBackendExtension } from '../interactions/core';
import type { GaesupPlugin, PluginContext } from '../plugins';
import { PhysicsBridge } from './bridge/PhysicsBridge';

export interface MotionsPhysicsExtension {
  Bridge: typeof PhysicsBridge;
  createBridge: () => PhysicsBridge;
}

export type MotionsInputExtension = InputBackendExtension;

export interface MotionsRuntimeOptions {
  physicsExtensionId?: string;
  inputExtensionId?: string;
}

export interface MotionsRuntimeService {
  create: (options?: MotionsRuntimeOptions) => MotionsRuntime;
  inputExtensionId?: string;
}
export const RUNTIME_OWNED_MOTIONS_SERVICE_ID = 'gaesup.runtime.motions';

export type MotionsTeleportPayload = {
  position: {
    x: number;
    y: number;
    z: number;
  };
  spawnPosition?: {
    x: number;
    y: number;
    z: number;
  };
  effect?: {
    id?: string;
    kind?: 'instant' | 'drop';
    dropHeight?: number;
    durationMs?: number;
  };
};

export interface MotionsRuntime {
  physicsBridge: PhysicsBridge;
  inputAdapter: InputAdapter;
  events: PluginContext['events'];
  extensionIds: {
    physics: string;
    input: string;
  };
}

export interface MotionsPluginOptions {
  id?: string;
  physicsExtensionId?: string;
  inputExtensionId?: string;
  runtimeServiceId?: string;
  createPhysicsBridge?: () => PhysicsBridge;
  createInputAdapter?: () => InputAdapter;
  /** Releases a custom source once per plugin generation, after the world disconnects it. */
  disposeInputAdapter?: (adapter: InputAdapter) => void | Promise<void>;
}

const DEFAULT_PLUGIN_ID = 'gaesup.motions';
export const DEFAULT_MOTIONS_PHYSICS_EXTENSION_ID = 'physics.bridge';
export const DEFAULT_MOTIONS_INPUT_EXTENSION_ID = DEFAULT_INTERACTION_INPUT_EXTENSION_ID;
export const DEFAULT_MOTIONS_RUNTIME_SERVICE_ID = 'motions.runtime';
export const MOTIONS_TELEPORT_EVENT = 'motions:teleport';

declare module '../plugins' {
  interface SystemExtensionMap {
    'physics.bridge': MotionsPhysicsExtension;
  }

  interface InputExtensionMap {
    'interaction.input': MotionsInputExtension;
  }

  interface ServiceExtensionMap {
    'motions.runtime': MotionsRuntimeService;
  }
}

export function createMotionsRuntime(
  ctx: PluginContext,
  options: MotionsRuntimeOptions = {},
): MotionsRuntime {
  const physicsExtensionId = options.physicsExtensionId ?? DEFAULT_MOTIONS_PHYSICS_EXTENSION_ID;
  const inputExtensionId = options.inputExtensionId ?? DEFAULT_MOTIONS_INPUT_EXTENSION_ID;
  const physics = ctx.systems.require<MotionsPhysicsExtension>(physicsExtensionId);
  const input = ctx.input.require<MotionsInputExtension>(inputExtensionId);
  const world = ctx.services.get<MotionsRuntimeService>(RUNTIME_OWNED_MOTIONS_SERVICE_ID);
  const owned = inputExtensionId === (world?.inputExtensionId ?? DEFAULT_MOTIONS_INPUT_EXTENSION_ID) ? world : undefined;

  return {
    physicsBridge: physics.createBridge(),
    inputAdapter: owned?.create().inputAdapter ?? input.createAdapter(),
    events: ctx.events,
    extensionIds: {
      physics: physicsExtensionId,
      input: inputExtensionId,
    },
  };
}

export function requestMotionsTeleport(
  runtime: Pick<MotionsRuntime, 'events'>,
  payload: MotionsTeleportPayload,
): void {
  runtime.events.emit(MOTIONS_TELEPORT_EVENT, payload);
}

export function createMotionsPlugin(options: MotionsPluginOptions = {}): GaesupPlugin {
  const pluginId = options.id ?? DEFAULT_PLUGIN_ID;
  const physicsExtensionId = options.physicsExtensionId ?? DEFAULT_MOTIONS_PHYSICS_EXTENSION_ID;
  const inputExtensionId = options.inputExtensionId ?? DEFAULT_MOTIONS_INPUT_EXTENSION_ID;
  const runtimeServiceId = options.runtimeServiceId ?? DEFAULT_MOTIONS_RUNTIME_SERVICE_ID;
  const inputAdapters = new WeakMap<PluginContext, InputAdapter>();

  return {
    id: pluginId,
    name: 'GaeSup Motions',
    version: '0.1.0',
    runtime: 'client',
    capabilities: ['motions', 'physics', 'input'],
    setup(ctx: PluginContext) {
      const owned = ctx.services.get<MotionsRuntimeService>(RUNTIME_OWNED_MOTIONS_SERVICE_ID);
      const createPhysicsBridge = options.createPhysicsBridge ?? (() => owned?.create().physicsBridge ?? new PhysicsBridge());
      const createInputAdapter = () => {
        let adapter = inputAdapters.get(ctx);
        if (!adapter) {
          adapter = options.createInputAdapter?.() ?? owned?.create().inputAdapter ?? createInteractionInputAdapter();
          inputAdapters.set(ctx, adapter);
        }
        return adapter;
      };
      ctx.systems.register(physicsExtensionId, {
        Bridge: PhysicsBridge,
        createBridge: createPhysicsBridge,
      }, pluginId);
      ctx.input.register(inputExtensionId, {
        createAdapter: createInputAdapter,
      }, pluginId);
      ctx.services.register(runtimeServiceId, {
        create: (runtimeOptions?: MotionsRuntimeOptions) => createMotionsRuntime(ctx, {
          physicsExtensionId,
          inputExtensionId,
          ...runtimeOptions,
        }),
      }, pluginId);
      ctx.events.emit('motions:ready', {
        pluginId,
        physicsExtensionId,
        inputExtensionId,
        runtimeServiceId,
      });
    },
    dispose(ctx: PluginContext) {
      const inputAdapter = inputAdapters.get(ctx); inputAdapters.delete(ctx);
      ctx.systems.remove(physicsExtensionId);
      ctx.input.remove(inputExtensionId);
      ctx.services.remove(runtimeServiceId);
      if (inputAdapter && options.createInputAdapter && !isWorldInputSourceOwned(inputAdapter)) return options.disposeInputAdapter?.(inputAdapter);
    },
  };
}

export const motionsPlugin = createMotionsPlugin();

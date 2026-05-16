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
}
export type MotionsTeleportPayload = {
    position: {
        x: number;
        y: number;
        z: number;
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
}
export declare const DEFAULT_MOTIONS_PHYSICS_EXTENSION_ID = "physics.bridge";
export declare const DEFAULT_MOTIONS_INPUT_EXTENSION_ID = "interaction.input";
export declare const DEFAULT_MOTIONS_RUNTIME_SERVICE_ID = "motions.runtime";
export declare const MOTIONS_TELEPORT_EVENT = "motions:teleport";
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
export declare function createMotionsRuntime(ctx: PluginContext, options?: MotionsRuntimeOptions): MotionsRuntime;
export declare function requestMotionsTeleport(runtime: Pick<MotionsRuntime, 'events'>, payload: MotionsTeleportPayload): void;
export declare function createMotionsPlugin(options?: MotionsPluginOptions): GaesupPlugin;
export declare const motionsPlugin: GaesupPlugin;

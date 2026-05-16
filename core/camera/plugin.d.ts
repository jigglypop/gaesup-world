import * as THREE from 'three';
import type { GaesupPlugin } from '../plugins';
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
export type CameraSerializedOptionValue = string | number | boolean | null | undefined | SerializedVector3 | SerializedEuler | CameraSerializedOptionValue[] | {
    [key: string]: CameraSerializedOptionValue;
};
export interface CameraSerializedState {
    mode: ModeState;
    cameraOption: {
        [key: string]: CameraSerializedOptionValue;
    };
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
export declare const DEFAULT_CAMERA_SYSTEM_EXTENSION_ID = "camera.system";
export declare const DEFAULT_CAMERA_SAVE_EXTENSION_ID = "camera";
export declare const DEFAULT_CAMERA_STORE_SERVICE_ID = "camera.store";
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
export declare function createCameraPlugin(options?: CameraPluginOptions): GaesupPlugin;
export declare const cameraPlugin: GaesupPlugin;
export {};

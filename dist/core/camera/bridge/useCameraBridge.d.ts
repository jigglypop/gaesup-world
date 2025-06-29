import { BaseCameraEngine } from './BaseCameraEngine';
import { CameraEngineConfig, CameraEngineEvents } from './types';
export declare function useCameraBridge<T extends BaseCameraEngine>(EngineClass: new (config: CameraEngineConfig) => T, initialConfig: CameraEngineConfig, eventHandlers?: Partial<{
    [K in keyof CameraEngineEvents]: (data: CameraEngineEvents[K]) => void;
}>): {
    engine: T;
    updateConfig: (config: Partial<CameraEngineConfig>) => void;
    getState: () => any;
    getMetrics: () => any;
};

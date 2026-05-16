import { BaseCameraSystem } from './BaseCameraSystem';
import type { CameraSystemConfig, CameraSystemEvents, CameraSystemState, ICameraSystemMonitor } from './types';
export declare function useCameraBridge<T extends BaseCameraSystem>(SystemClass: new (config: CameraSystemConfig) => T, initialConfig: CameraSystemConfig, eventHandlers?: Partial<{
    [K in keyof CameraSystemEvents]: (data: CameraSystemEvents[K]) => void;
}>): {
    system: T;
    updateConfig: (config: Partial<CameraSystemConfig>) => void;
    getState: () => CameraSystemState;
    getMetrics: () => ReturnType<ICameraSystemMonitor['getMetrics']>;
};

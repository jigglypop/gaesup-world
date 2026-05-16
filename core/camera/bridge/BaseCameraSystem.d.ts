import { CameraEventValue, CameraSystemConfig, ICameraSystemMonitor, CameraSystemEmitter, CameraSystemState } from './types';
export declare function cloneCameraSystemConfig(config: CameraSystemConfig): CameraSystemConfig;
export declare abstract class BaseCameraSystem implements ICameraSystemMonitor {
    emitter: CameraSystemEmitter;
    protected config: CameraSystemConfig;
    private metrics;
    protected constructor(initialConfig: CameraSystemConfig);
    updateConfig(newConfig: Partial<CameraSystemConfig>): void;
    getConfig(): CameraSystemConfig;
    getState(): CameraSystemState;
    getMetrics(): {
        frameCount: number;
        averageFrameTime: number;
        lastUpdateTime: number;
    };
    protected trackFrameMetrics(deltaTime: number): void;
    protected emitError(message: string, details?: CameraEventValue): void;
    destroy(): void;
    abstract update(deltaTime: number): void;
}

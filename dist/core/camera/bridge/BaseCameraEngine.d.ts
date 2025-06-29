import { CameraEngineConfig, ICameraEngineMonitor, CameraEngineEmitter } from './types';
export declare abstract class BaseCameraEngine implements ICameraEngineMonitor {
    emitter: CameraEngineEmitter;
    protected config: CameraEngineConfig;
    private metrics;
    protected constructor(initialConfig: CameraEngineConfig);
    updateConfig(newConfig: Partial<CameraEngineConfig>): void;
    getConfig(): CameraEngineConfig;
    getState(): any;
    getMetrics(): {
        frameCount: number;
        averageFrameTime: number;
        lastUpdateTime: number;
    };
    protected trackFrameMetrics(deltaTime: number): void;
    protected emitError(message: string, details?: any): void;
    destroy(): void;
    abstract update(deltaTime: number): void;
}

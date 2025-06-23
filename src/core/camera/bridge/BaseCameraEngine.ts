import mitt from 'mitt';
import { CameraEngineEvents, CameraEngineConfig, ICameraEngineMonitor, CameraEngineEmitter } from './types';

export abstract class BaseCameraEngine implements ICameraEngineMonitor {
  public emitter: CameraEngineEmitter;
  protected config: CameraEngineConfig;
  private metrics = {
    frameCount: 0,
    totalFrameTime: 0,
    lastUpdateTime: 0,
  };
  protected constructor(initialConfig: CameraEngineConfig) {
    this.emitter = mitt<CameraEngineEvents>();
    this.config = initialConfig;
  }

  public updateConfig(newConfig: Partial<CameraEngineConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    Object.keys(newConfig).forEach(key => {
      this.emitter.emit('configChange', { 
        key, 
        value: newConfig[key as keyof CameraEngineConfig]
      });
    });

    if (oldConfig.mode !== this.config.mode) {
      this.emitter.emit('modeChange', { 
        from: oldConfig.mode,
        to: this.config.mode 
      });
    }
  }
  public getConfig(): CameraEngineConfig {
    return { ...this.config };
  }
  public getState(): any {
    return {
      config: this.getConfig(),
      metrics: this.getMetrics(),
    };
  }

  public getMetrics() {
    return {
      frameCount: this.metrics.frameCount,
      averageFrameTime: this.metrics.frameCount > 0 
        ? this.metrics.totalFrameTime / this.metrics.frameCount 
        : 0,
      lastUpdateTime: this.metrics.lastUpdateTime,
    };
  }

  protected trackFrameMetrics(deltaTime: number): void {
    this.metrics.frameCount++;
    this.metrics.totalFrameTime += deltaTime;
    this.metrics.lastUpdateTime = Date.now();
  }

  protected emitError(message: string, details?: any): void {
    this.emitter.emit('error', { message, details });
  }

  public destroy(): void {
    this.emitter.all.clear();
  }

  abstract update(deltaTime: number): void;
} 
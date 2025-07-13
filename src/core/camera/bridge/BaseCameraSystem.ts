import mitt from 'mitt';
import { CameraSystemEvents, CameraSystemConfig, ICameraSystemMonitor, CameraSystemEmitter, CameraSystemState } from './types';
import { Profile, HandleError } from '../../boilerplate/decorators';

export abstract class BaseCameraSystem implements ICameraSystemMonitor {
  public emitter: CameraSystemEmitter;
  protected config: CameraSystemConfig;
  private metrics = {
    frameCount: 0,
    totalFrameTime: 0,
    lastUpdateTime: 0,
  };
  protected constructor(initialConfig: CameraSystemConfig) {
    this.emitter = mitt<CameraSystemEvents>();
    this.config = initialConfig;
  }

  @HandleError()
  public updateConfig(newConfig: Partial<CameraSystemConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    Object.keys(newConfig).forEach(key => {
      this.emitter.emit('configChange', { 
        key, 
        value: newConfig[key as keyof CameraSystemConfig]
      });
    });

    if (oldConfig.mode !== this.config.mode) {
      this.emitter.emit('modeChange', { 
        from: oldConfig.mode,
        to: this.config.mode 
      });
    }
  }
  public getConfig(): CameraSystemConfig {
    return { ...this.config };
  }
  public getState(): CameraSystemState {
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

  @Profile()
  protected trackFrameMetrics(deltaTime: number): void {
    this.metrics.frameCount++;
    this.metrics.totalFrameTime += deltaTime;
    this.metrics.lastUpdateTime = Date.now();
  }

  protected emitError(message: string, details?: unknown): void {
    this.emitter.emit('error', { message, details });
  }

  @HandleError()
  public destroy(): void {
    this.emitter.all.clear();
  }

  abstract update(deltaTime: number): void;
} 
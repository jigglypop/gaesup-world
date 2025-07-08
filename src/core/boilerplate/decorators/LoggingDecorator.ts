import { SystemDecorator } from './SystemDecorator';
import { BaseSystem } from '../entity/BaseSystem';

export interface LoggingOptions {
  enablePerformanceLog?: boolean;
  enableMemoryLog?: boolean;
  logInterval?: number;
}

/**
 * 시스템 성능 및 메모리 사용량을 로깅하는 데코레이터
 */
export class LoggingDecorator extends SystemDecorator {
  private frameCount = 0;
  private totalFrameTime = 0;
  private lastLogTime = 0;
  private options: LoggingOptions;

  constructor(inner: BaseSystem, options: LoggingOptions = {}) {
    super(inner);
    this.options = {
      enablePerformanceLog: true,
      enableMemoryLog: true,
      logInterval: 1000,
      ...options
    };
  }

  override update(dt: number): void {
    const startTime = performance.now();
    super.update(dt);
    const frameTime = performance.now() - startTime;
    
    this.frameCount++;
    this.totalFrameTime += frameTime;
    
    const now = Date.now();
    if (now - this.lastLogTime >= this.options.logInterval!) {
      this.logMetrics();
      this.lastLogTime = now;
    }
  }

  private logMetrics(): void {
    if (this.options.enablePerformanceLog) {
      const avgFrameTime = this.totalFrameTime / this.frameCount;
      const fps = 1000 / avgFrameTime;
      console.log(`[Engine Performance] FPS: ${fps.toFixed(2)}, Avg Frame Time: ${avgFrameTime.toFixed(2)}ms`);
    }

    if (this.options.enableMemoryLog && performance.memory) {
      const memory = performance.memory;
      const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(2);
      const totalMB = (memory.totalJSHeapSize / 1048576).toFixed(2);
      console.log(`[Engine Memory] Used: ${usedMB}MB / Total: ${totalMB}MB`);
    }

    this.frameCount = 0;
    this.totalFrameTime = 0;
  }

  override dispose(): void {
    if (this.frameCount > 0) {
      this.logMetrics();
    }
    super.dispose();
  }
} 
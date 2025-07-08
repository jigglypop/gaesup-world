import { SystemDecorator } from './SystemDecorator';

/**
 * 런타임 생명주기를 자동으로 관리하는 데코레이터
 * requestAnimationFrame 루프를 시작하고 중지합니다
 */
export class RuntimeManagerDecorator extends SystemDecorator {
  private rafHandle = 0;
  private running = false;
  private prevTime = 0;

  override async init(): Promise<void> {
    await super.init();
    this.running = true;
    this.prevTime = performance.now();
    this.rafHandle = requestAnimationFrame(this.loop);
  }

  private loop = (now: number): void => {
    if (!this.running) return;
    const dt = (now - this.prevTime) / 1000;
    this.update(dt);
    this.prevTime = now;
    this.rafHandle = requestAnimationFrame(this.loop);
  };

  override dispose(): void {
    this.running = false;
    cancelAnimationFrame(this.rafHandle);
    super.dispose();
  }
} 
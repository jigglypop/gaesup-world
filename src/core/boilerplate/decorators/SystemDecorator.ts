import { BaseSystem } from '../entity/BaseSystem';

/**
 * 시스템 데코레이터의 베이스 클래스
 * 모든 메서드를 내부 시스템에 위임합니다
 */
export abstract class SystemDecorator implements BaseSystem {
  protected constructor(protected inner: BaseSystem) {}
  
  async init(): Promise<void> {
    return this.inner.init();
  }
  
  update(dt: number): void {
    this.inner.update(dt);
  }
  
  dispose(): void {
    this.inner.dispose();
  }
} 
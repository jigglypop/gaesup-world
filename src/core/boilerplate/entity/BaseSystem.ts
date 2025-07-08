export interface BaseSystem {
  /**
   * 비동기 리소스 초기화
   */
  init(): Promise<void>;
  
  /**
   * 매 프레임 업데이트
   * @param dt - 델타 타임 (초 단위)
   */
  update(dt: number): void;
  
  /**
   * 리소스 정리 및 메모리 해제
   */
  dispose(): void;
} 
export interface SystemCapabilities {
  hasAsync?: boolean;
  hasMetrics?: boolean;
  hasState?: boolean;
  hasEvents?: boolean;
}

export interface SystemContext {
  deltaTime: number;
  totalTime: number;
  frameCount: number;
}

export interface BaseSystem<TState = unknown, TMetrics = unknown> {
  /**
   * 시스템 고유 ID
   */
  readonly id?: string;
  
  /**
   * 시스템 기능 정의
   */
  readonly capabilities?: SystemCapabilities;
  
  /**
   * 비동기 리소스 초기화
   */
  init(): Promise<void>;
  
  /**
   * 시스템 시작 (init 이후 호출)
   */
  start?(): Promise<void>;
  
  /**
   * 매 프레임 업데이트
   * @param context - 프레임 컨텍스트 정보
   */
  update(context: SystemContext): void;
  
  /**
   * 시스템 일시정지
   */
  pause?(): void;
  
  /**
   * 시스템 재개
   */
  resume?(): void;
  
  /**
   * 시스템 리셋
   */
  reset?(): void;
  
  /**
   * 리소스 정리 및 메모리 해제
   */
  dispose(): void;
  
  /**
   * 현재 상태 조회
   */
  getState?(): Readonly<TState>;
  
  /**
   * 메트릭스 조회
   */
  getMetrics?(): Readonly<TMetrics>;
} 
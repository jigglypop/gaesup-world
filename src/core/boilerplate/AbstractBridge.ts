export type IDisposable = {
  dispose(): void;
};

export type BridgeEventType = 'register' | 'unregister' | 'execute' | 'snapshot' | 'error';

export interface BridgeEvent<EngineType, SnapshotType, CommandType> {
  type: BridgeEventType;
  id: string;
  timestamp: number;
  data?: {
    engine?: EngineType;
    command?: CommandType;
    snapshot?: SnapshotType;
    error?: Error;
  };
}

export type BridgeMiddleware<EngineType, SnapshotType, CommandType> = (
  event: BridgeEvent<EngineType, SnapshotType, CommandType>,
  next: () => void
) => void;

/**
 * 도메인 브릿지의 추상 클래스.
 * @template EngineType - 브릿지가 관리할 엔진 또는 ref의 타입 (e.g., RapierRigidBody).
 * @template SnapshotType - 상태 스냅샷의 타입.
 * @template CommandType - 실행할 명령의 타입.
 */
export abstract class AbstractBridge<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType,
> {
  protected engines: Map<string, EngineType>;
  protected snapshots: Map<string, Readonly<SnapshotType>>;
  private eventListeners: Set<(snapshot: SnapshotType, id: string) => void>;
  private eventHandlers: Map<BridgeEventType, Set<(event: BridgeEvent<EngineType, SnapshotType, CommandType>) => void>>;
  private middlewares: BridgeMiddleware<EngineType, SnapshotType, CommandType>[];

  constructor() {
    this.engines = new Map();
    this.snapshots = new Map();
    this.eventListeners = new Set();
    this.eventHandlers = new Map();
    this.middlewares = [];
  }
  /**
   * 미들웨어를 추가합니다.
   */
  use(middleware: BridgeMiddleware<EngineType, SnapshotType, CommandType>): void {
    this.middlewares.push(middleware);
  }
  /**
   * 이벤트를 발생시킵니다.
   */
  protected emit(event: BridgeEvent<EngineType, SnapshotType, CommandType>): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
    // 미들웨어 체인 실행
    let index = 0;
    const next = () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        middleware?.(event, next);
      }
    };
    next();
  }

  /**
   * 이벤트 핸들러를 등록합니다.
   */
  on(type: BridgeEventType, handler: (event: BridgeEvent<EngineType, SnapshotType, CommandType>) => void): () => void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }
    this.eventHandlers.get(type)!.add(handler);
    
    return () => {
      this.eventHandlers.get(type)?.delete(handler);
    };
  }

  /**
   * 엔진/ref를 브릿지에 등록합니다.
   * @param id - 엔티티의 고유 ID.
   * @param engine - 관리할 엔진 또는 ref 객체.
   */
  register(id: string, engine: EngineType): void {
    this.engines.set(id, engine);
    this.emit({
      type: 'register',
      id,
      timestamp: Date.now(),
      data: { engine }
    });
  }

  /**
   * 등록된 엔진/ref를 제거하고 dispose를 호출합니다.
   * @param id - 엔티티의 고유 ID.
   */
  unregister(id: string): void {
    const engine = this.engines.get(id);
    if (engine) {
      engine.dispose();
      this.engines.delete(id);
      this.snapshots.delete(id);
      this.emit({
        type: 'unregister',
        id,
        timestamp: Date.now(),
        data: { engine }
      });
    }
  }
  
  getEngine(id: string): EngineType | undefined {
    return this.engines.get(id);
  }

  /**
   * 특정 엔진/ref에 명령을 실행합니다. (구현 필요)
   */
  abstract execute(id: string, command: CommandType): void;

  /**
   * 특정 엔진/ref의 현재 상태 스냅샷을 반환합니다. (구현 필요)
   */
  abstract snapshot(id: string): Readonly<SnapshotType> | null;
  
  /**
   * 캐시된 스냅샷을 가져옵니다.
   */
  getCachedSnapshot(id: string): Readonly<SnapshotType> | undefined {
    return this.snapshots.get(id);
  }

  /**
   * 스냅샷을 캐시합니다.
   */
  protected cacheSnapshot(id: string, snapshot: Readonly<SnapshotType>): void {
    this.snapshots.set(id, snapshot);
  }
  
  /**
   * 브릿지의 상태 변경을 구독합니다.
   * @param listener - 스냅샷과 ID를 인자로 받는 콜백 함수.
   * @returns 구독 해제 함수.
   */
  subscribe(listener: (snapshot: SnapshotType, id: string) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  /**
   * 모든 구독자에게 현재 스냅샷을 알립니다.
   * @param id - 알림을 보낼 엔티티의 ID.
   */
  notifyListeners(id: string): void {
    if (this.eventListeners.size === 0) return;
    const snapshot = this.snapshot(id);
    if (snapshot) {
      this.cacheSnapshot(id, snapshot);
      this.eventListeners.forEach(listener => listener(snapshot, id));
    }
  }

  /**
   * 모든 등록된 엔진의 스냅샷을 반환합니다.
   */
  getAllSnapshots(): Map<string, Readonly<SnapshotType>> {
    const allSnapshots = new Map<string, Readonly<SnapshotType>>();
    this.engines.forEach((_, id) => {
      const snapshot = this.snapshot(id);
      if (snapshot) {
        allSnapshots.set(id, snapshot);
      }
    });
    return allSnapshots;
  }

  /**
   * 브릿지와 모든 관리 대상 엔진을 정리합니다.
   */
  dispose(): void {
    this.engines.forEach(engine => engine.dispose());
    this.engines.clear();
    this.snapshots.clear();
    this.eventListeners.clear();
    this.eventHandlers.clear();
    this.middlewares = [];
  }
} 
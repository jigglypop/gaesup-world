import { AbstractBridge, IDisposable, BridgeEvent } from './AbstractBridge';

export interface ManagedEntityOptions {
  enableCommandQueue?: boolean;
  maxQueueSize?: number;
  enableStateCache?: boolean;
  cacheTimeout?: number;
}

/**
 * 브릿지를 통해 엔진/ref를 관리하는 제네릭 유틸리티 클래스.
 * @template EngineType - 관리할 엔진 또는 ref 래퍼의 타입.
 * @template SnapshotType - 상태 스냅샷의 타입.
 * @template CommandType - 실행할 명령의 타입.
 */
export class ManagedEntity<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
> implements IDisposable {
  private commandQueue: CommandType[] = [];
  private lastSnapshot: Readonly<SnapshotType> | null = null;
  private lastSnapshotTime: number = 0;
  private disposed: boolean = false;
  private unsubscribers: Array<() => void> = [];

  /**
   * @param bridge - 사용할 Bridge 인스턴스.
   * @param id - 엔티티 ID.
   * @param engine - 관리할 엔진 또는 ref 래퍼 객체.
   * @param options - 선택적 설정.
   */
  constructor(
    private bridge: AbstractBridge<EngineType, SnapshotType, CommandType>,
    private id: string,
    public engine: EngineType,
    private options: ManagedEntityOptions = {}
  ) {
    this.bridge.register(this.id, this.engine);
    this.setupEventHandlers();
  }

  /**
   * 이벤트 핸들러를 설정합니다.
   */
  private setupEventHandlers(): void {
    // 명령 실행 이벤트 구독
    const unsubExecute = this.bridge.on('execute', (event: BridgeEvent<EngineType, SnapshotType, CommandType>) => {
      if (event.id === this.id && event.data?.command) {
        this.onCommandExecuted(event.data.command);
      }
    });
    this.unsubscribers.push(unsubExecute);

    // 스냅샷 이벤트 구독
    const unsubSnapshot = this.bridge.on('snapshot', (event: BridgeEvent<EngineType, SnapshotType, CommandType>) => {
      if (event.id === this.id && event.data?.snapshot) {
        this.onSnapshotTaken(event.data.snapshot);
      }
    });
    this.unsubscribers.push(unsubSnapshot);
  }

  /**
   * 명령이 실행된 후 호출됩니다.
   */
  protected onCommandExecuted(command: CommandType): void {
    // 하위 클래스에서 오버라이드 가능
  }

  /**
   * 스냅샷이 생성된 후 호출됩니다.
   */
  protected onSnapshotTaken(snapshot: SnapshotType): void {
    if (this.options.enableStateCache) {
      this.lastSnapshot = snapshot as Readonly<SnapshotType>;
      this.lastSnapshotTime = Date.now();
    }
  }

  /**
   * 브릿지에서 엔진/ref 등록을 해제합니다.
   */
  dispose(): void {
    if (this.disposed) return;
    
    this.disposed = true;
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    this.commandQueue = [];
    this.lastSnapshot = null;
    this.bridge.unregister(this.id);
  }

  /**
   * 브릿지를 통해 명령을 실행합니다.
   * @param command - 실행할 명령 객체.
   */
  execute(command: CommandType): void {
    if (this.disposed) {
      throw new Error(`ManagedEntity ${this.id} is already disposed`);
    }

    if (this.options.enableCommandQueue) {
      this.queueCommand(command);
    } else {
      this.bridge.execute(this.id, command);
    }
  }

  /**
   * 명령을 큐에 추가합니다.
   */
  private queueCommand(command: CommandType): void {
    const maxSize = this.options.maxQueueSize || 100;
    if (this.commandQueue.length >= maxSize) {
      this.commandQueue.shift(); // 가장 오래된 명령 제거
    }
    this.commandQueue.push(command);
  }

  /**
   * 큐에 있는 모든 명령을 실행합니다.
   */
  flushCommands(): void {
    if (this.disposed) return;
    
    while (this.commandQueue.length > 0) {
      const command = this.commandQueue.shift();
      if (command) {
        this.bridge.execute(this.id, command);
      }
    }
  }

  /**
   * 브릿지를 통해 현재 상태 스냅샷을 가져옵니다.
   * @returns 읽기 전용 스냅샷 또는 null.
   */
  snapshot(): Readonly<SnapshotType> | null {
    if (this.disposed) return null;

    // 캐시된 스냅샷 사용 여부 확인
    if (this.options.enableStateCache && this.lastSnapshot) {
      const cacheTimeout = this.options.cacheTimeout || 16; // 기본 16ms (60fps)
      if (Date.now() - this.lastSnapshotTime < cacheTimeout) {
        return this.lastSnapshot;
      }
    }

    const snapshot = this.bridge.snapshot(this.id);
    if (snapshot && this.options.enableStateCache) {
      this.lastSnapshot = snapshot;
      this.lastSnapshotTime = Date.now();
    }
    return snapshot;
  }

  /**
   * 엔티티가 dispose되었는지 확인합니다.
   */
  isDisposed(): boolean {
    return this.disposed;
  }

  /**
   * 엔티티 ID를 반환합니다.
   */
  getId(): string {
    return this.id;
  }

  /**
   * 현재 명령 큐 크기를 반환합니다.
   */
  getQueueSize(): number {
    return this.commandQueue.length;
  }
} 
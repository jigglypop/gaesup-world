import { AbstractBridge } from '../bridge/AbstractBridge';
import { Autowired } from '../di/Autowired';
import { BridgeEvent, DEFAULT_CACHE_TIMEOUT_MS, DEFAULT_COMMAND_QUEUE_SIZE, IDisposable, ManagedEntityOptions } from '../types';

export class ManagedEntity<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
> implements IDisposable {
  @Autowired()
  private bridge!: AbstractBridge<EngineType, SnapshotType, CommandType>;

  private commandQueue: CommandType[] = [];
  private lastSnapshot: Readonly<SnapshotType> | null = null;
  private lastSnapshotTime: number = 0;
  private disposed: boolean = false;
  private unsubscribers: Array<() => void> = [];

  constructor(
    private id: string,
    public engine: EngineType,
    private options: ManagedEntityOptions<EngineType, SnapshotType, CommandType> = {}
  ) {
    // Bridge will be injected by DI container
  }

  public initialize(): void {
    if (!this.bridge) {
        throw new Error(`ManagedEntity ${this.id}: Bridge is not injected. Ensure this entity is created via DI container or injector is configured.`);
    }
    this.bridge.register(this.id, this.engine);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    const unsubExecute = this.bridge.on('execute', (event: BridgeEvent<EngineType, SnapshotType, CommandType>) => {
      if (event.id === this.id && event.data?.command) {
        this.onCommandExecuted(event.data.command);
      }
    });
    this.unsubscribers.push(unsubExecute);
    const unsubSnapshot = this.bridge.on('snapshot', (event: BridgeEvent<EngineType, SnapshotType, CommandType>) => {
      if (event.id === this.id && event.data?.snapshot) {
        this.onSnapshotTaken(event.data.snapshot);
      }
    });
    this.unsubscribers.push(unsubSnapshot);
  }
  protected onCommandExecuted(command: CommandType): void {}
  protected onSnapshotTaken(snapshot: SnapshotType): void {
    if (this.options.enableStateCache) {
      this.lastSnapshot = snapshot as Readonly<SnapshotType>;
      this.lastSnapshotTime = Date.now();
    }
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.options.onDispose) {
      this.options.onDispose(this);
    }
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    this.commandQueue = [];
    this.lastSnapshot = null;
    this.bridge.unregister(this.id);
  }
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
  private queueCommand(command: CommandType): void {
    const maxSize = this.options.maxQueueSize || DEFAULT_COMMAND_QUEUE_SIZE;
    if (this.commandQueue.length >= maxSize) {
      this.commandQueue.shift();
    }
    this.commandQueue.push(command);
  }
  flushCommands(): void {
    if (this.disposed) return;
    while (this.commandQueue.length > 0) {
      const command = this.commandQueue.shift();
      if (command) {
        this.bridge.execute(this.id, command);
      }
    }
  }
  snapshot(): Readonly<SnapshotType> | null {
    if (this.disposed) return null;
    if (this.options.enableStateCache && this.lastSnapshot) {
      const cacheTimeout = this.options.cacheTimeout || DEFAULT_CACHE_TIMEOUT_MS;
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
  isDisposed(): boolean {
    return this.disposed;
  }
  getId(): string {
    return this.id;
  }
  getQueueSize(): number {
    return this.commandQueue.length;
  }
} 
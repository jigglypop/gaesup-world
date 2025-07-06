import { IDisposable, BridgeEventType, BridgeEvent, BridgeMiddleware } from '../types';

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
  use(middleware: BridgeMiddleware<EngineType, SnapshotType, CommandType>): void {
    this.middlewares.push(middleware);
  }
  protected emit(event: BridgeEvent<EngineType, SnapshotType, CommandType>): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
    let index = 0;
    const next = () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        middleware?.(event, next);
      }
    };
    next();
  }
  on(type: BridgeEventType, handler: (event: BridgeEvent<EngineType, SnapshotType, CommandType>) => void): () => void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }
    this.eventHandlers.get(type)!.add(handler);
    return () => {
      this.eventHandlers.get(type)?.delete(handler);
    };
  }
  register(id: string, ...args: any[]): void {
    const engine = this.buildEngine(id, ...args);
    if (engine) {
      this.engines.set(id, engine);
      this.emit({
        type: 'register',
        id,
        timestamp: Date.now(),
        data: { engine }
      });
    }
  }
  protected abstract buildEngine(id: string, ...args: any[]): EngineType | null;
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
  execute(id: string, command: CommandType): void {
    const engine = this.getEngine(id);
    if (!engine) return;
    this.emit({ type: 'execute', id, timestamp: Date.now(), data: { command } });
    this.executeCommand(engine, command, id);
    this.notifyListeners(id);
  }
  protected abstract executeCommand(engine: EngineType, command: CommandType, id: string): void;
  snapshot(id: string): Readonly<SnapshotType> | null {
    const engine = this.getEngine(id);
    if (!engine) return null;
    const snapshot = this.createSnapshot(engine, id);
    if (snapshot) {
      this.emit({ type: 'snapshot', id, timestamp: Date.now(), data: { snapshot } });
    }
    return snapshot;
  }
  protected abstract createSnapshot(engine: EngineType, id: string): SnapshotType | null;
  getCachedSnapshot(id: string): Readonly<SnapshotType> | undefined {
    return this.snapshots.get(id);
  }
  protected cacheSnapshot(id: string, snapshot: Readonly<SnapshotType>): void {
    this.snapshots.set(id, snapshot);
  }
  subscribe(listener: (snapshot: SnapshotType, id: string) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }
  notifyListeners(id: string): void {
    if (this.eventListeners.size === 0) return;
    const snapshot = this.snapshot(id);
    if (snapshot) {
      this.cacheSnapshot(id, snapshot);
      this.eventListeners.forEach(listener => listener(snapshot, id));
    }
  }
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
  dispose(): void {
    this.engines.forEach(engine => engine.dispose());
    this.engines.clear();
    this.snapshots.clear();
    this.eventListeners.clear();
    this.eventHandlers.clear();
    this.middlewares = [];
  }
}
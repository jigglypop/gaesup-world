import { IDisposable, BridgeEventType, BridgeEvent, BridgeMiddleware, RuntimeValue } from '../types';
export declare abstract class AbstractBridge<EngineType extends IDisposable, SnapshotType, CommandType> {
    protected engines: Map<string, EngineType>;
    protected snapshots: Map<string, Readonly<SnapshotType>>;
    private eventListeners;
    private eventHandlers;
    private middlewares;
    constructor();
    use(middleware: BridgeMiddleware<EngineType, SnapshotType, CommandType>): void;
    protected emit(event: BridgeEvent<EngineType, SnapshotType, CommandType>): void;
    on(type: BridgeEventType, handler: (event: BridgeEvent<EngineType, SnapshotType, CommandType>) => void): () => void;
    register(id: string, ...args: RuntimeValue[]): void;
    protected abstract buildEngine(id: string, ...args: RuntimeValue[]): EngineType | null;
    unregister(id: string): void;
    getEngine(id: string): EngineType | undefined;
    execute(id: string, command: CommandType): void;
    protected abstract executeCommand(engine: EngineType, command: CommandType, id: string): void;
    snapshot(id: string): Readonly<SnapshotType> | null;
    protected abstract createSnapshot(engine: EngineType, id: string): SnapshotType | null;
    getCachedSnapshot(id: string): Readonly<SnapshotType> | undefined;
    protected cacheSnapshot(id: string, snapshot: Readonly<SnapshotType>): void;
    subscribe(listener: (snapshot: SnapshotType, id: string) => void): () => void;
    notifyListeners(id: string): void;
    getAllSnapshots(): Map<string, Readonly<SnapshotType>>;
    dispose(): void;
}

import { IDisposable, ManagedEntityOptions } from '../types';
export declare class ManagedEntity<EngineType extends IDisposable, SnapshotType, CommandType> implements IDisposable {
    private id;
    engine: EngineType;
    private options;
    private bridge;
    private commandQueue;
    private lastSnapshot;
    private lastSnapshotTime;
    private disposed;
    private unsubscribers;
    constructor(id: string, engine: EngineType, options?: ManagedEntityOptions<EngineType, SnapshotType, CommandType>);
    initialize(): void;
    private setupEventHandlers;
    protected onCommandExecuted(command: CommandType): void;
    protected onSnapshotTaken(snapshot: SnapshotType): void;
    dispose(): void;
    execute(command: CommandType): void;
    private queueCommand;
    flushCommands(): void;
    snapshot(): Readonly<SnapshotType> | null;
    isDisposed(): boolean;
    getId(): string;
    getQueueSize(): number;
}

import { ManagedEntity } from "../entity/ManagedEntity";

export type BaseState = {
    lastUpdate: number;
};

export type BaseMetrics = {
    frameTime: number;
};

export type SystemOptions = {
    initialState?: Record<string, unknown>;
    initialMetrics?: Record<string, unknown>;
};

export type SystemUpdateArgs = {
    deltaTime: number;
};

export type IDisposable = {
  dispose(): void;
};

export type RefObject<T> = { current: T };

export type BridgeEventType = 'register' | 'unregister' | 'execute' | 'snapshot' | 'error';

export type BridgeEvent<EngineType, SnapshotType, CommandType> = {
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

export type ManagedEntityOptions<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType,
> = {
  enableCommandQueue?: boolean;
  maxQueueSize?: number;
  enableStateCache?: boolean;
  cacheTimeout?: number;
  onInit?: (entity: ManagedEntity<EngineType, SnapshotType, CommandType>) => void;
  onDispose?: (entity: ManagedEntity<EngineType, SnapshotType, CommandType>) => void;
};

export type UseBaseFrameOptions = {
    priority?: number;
    enabled?: boolean;
    throttle?: number;
    skipWhenHidden?: boolean;
}

export type UseBaseLifecycleOptions<EngineType> = {
    onRegister?: (engine: EngineType) => void | (() => void);
    onUnregister?: (engine: EngineType) => void;
    dependencies?: unknown[];
    enabled?: boolean;
}

export type UseManagedEntityOptions<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType,
> = ManagedEntityOptions<EngineType, SnapshotType, CommandType> &
  UseBaseFrameOptions &
  UseBaseLifecycleOptions<EngineType> & {
    frameCallback?: () => void;
  };

export const DEFAULT_CACHE_TIMEOUT_MS = 16;
export const DEFAULT_COMMAND_QUEUE_SIZE = 100;
export const MILLISECONDS_IN_SECOND = 1000;

export type Constructor<T = unknown> = new (...args: unknown[]) => T;
export type AbstractConstructor<T = unknown> = abstract new (...args: unknown[]) => T;
export type ServiceTarget<T = unknown> = Constructor<T> | AbstractConstructor<T>;
export type Factory<T> = () => T;
export type Token<T> = ServiceTarget<T> | string | symbol;
export type BridgeClass = new (...args: unknown[]) => unknown
export type BridgeInstance = IDisposable;
export type BridgeConstructor = new (...args: unknown[]) => BridgeInstance; 
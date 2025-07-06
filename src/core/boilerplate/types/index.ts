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

export type ManagedEntityOptions = {
  enableCommandQueue?: boolean;
  maxQueueSize?: number;
  enableStateCache?: boolean;
  cacheTimeout?: number;
  onInit?: <T extends ManagedEntity<any, any, any>>(entity: T) => void;
  onDispose?: <T extends ManagedEntity<any, any, any>>(entity: T) => void;
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
    dependencies?: any[];
    enabled?: boolean;
}

export type UseManagedEntityOptions = ManagedEntityOptions & 
    UseBaseFrameOptions & 
    UseBaseLifecycleOptions<any> & {
    frameCallback?: () => void;
};

export type Constructor<T = unknown> = new (...args: unknown[]) => T;
export type Factory<T> = () => T;
export type Token<T> = Constructor<T> | string | symbol; 
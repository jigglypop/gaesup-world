import { ManagedEntity } from "./ManagedEntity";

export interface BaseState {
    lastUpdate: number;
}

export interface BaseMetrics {
    frameTime: number;
}

export interface SystemOptions {
    initialState?: Record<string, unknown>;
    initialMetrics?: Record<string, unknown>;
}

export interface SystemUpdateArgs {
    deltaTime: number;
}

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

export type ManagedEntityOptions = {
  enableCommandQueue?: boolean;
  maxQueueSize?: number;
  enableStateCache?: boolean;
  cacheTimeout?: number;
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

export interface UseManagedEntityOptions extends ManagedEntityOptions {
    onInit?: <T extends ManagedEntity<any, any, any>>(entity: T) => void;
    onDispose?: <T extends ManagedEntity<any, any, any>>(entity: T) => void;
    skipLifecycle?: boolean;
    skipFrame?: boolean;
    frameCallback?: () => void;
}

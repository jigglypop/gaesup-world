import { AbstractBridge } from '../bridge/AbstractBridge';
import { IDisposable, UseBaseLifecycleOptions } from '../types';
export declare function useBaseLifecycle<EngineType extends IDisposable, SnapshotType, CommandType>(bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null, id: string, engine: EngineType | null, options?: UseBaseLifecycleOptions<EngineType>): void;
export declare function useDelayedLifecycle<EngineType extends IDisposable, SnapshotType, CommandType>(bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null, id: string, engineGetter: () => EngineType | null, options?: UseBaseLifecycleOptions<EngineType>): void;

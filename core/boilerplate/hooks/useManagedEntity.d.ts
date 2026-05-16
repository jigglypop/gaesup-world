import { RefObject } from 'react';
import { ManagedEntity } from '../entity/ManagedEntity';
import { IDisposable, UseManagedEntityOptions } from '../types';
import { AbstractBridge } from '../bridge/AbstractBridge';
export declare function useManagedEntity<EngineType extends IDisposable, SnapshotType, CommandType>(bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null, id: string, ref: RefObject<EngineType>, options?: UseManagedEntityOptions<EngineType, SnapshotType, CommandType>): ManagedEntity<EngineType, SnapshotType, CommandType> | null;
export declare function useBatchManagedEntities<EngineType extends IDisposable, SnapshotType, CommandType>(bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null, entries: Array<{
    id: string;
    ref: RefObject<EngineType>;
}>, options?: UseManagedEntityOptions<EngineType, SnapshotType, CommandType>): Array<ManagedEntity<EngineType, SnapshotType, CommandType> | null>;

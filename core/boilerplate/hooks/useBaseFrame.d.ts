import { AbstractBridge } from '../bridge/AbstractBridge';
import { IDisposable, UseBaseFrameOptions } from '../types';
export declare function useBaseFrame<EngineType extends IDisposable, SnapshotType, CommandType>(bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null, id: string, callback?: () => void, options?: UseBaseFrameOptions): void;
export declare function useConditionalFrame<EngineType extends IDisposable, SnapshotType, CommandType>(bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null, id: string, condition: () => boolean, callback?: () => void, options?: UseBaseFrameOptions): void;
export declare function useThrottledFrame<EngineType extends IDisposable, SnapshotType, CommandType>(bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null, id: string, fps: number, callback?: () => void, options?: Omit<UseBaseFrameOptions, 'throttle'>): void;

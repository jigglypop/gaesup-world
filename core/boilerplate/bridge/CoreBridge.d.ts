import 'reflect-metadata';
import { IDisposable } from '../types';
import { AbstractBridge } from './AbstractBridge';
export declare abstract class CoreBridge<EngineType extends IDisposable, SnapshotType, CommandType> extends AbstractBridge<EngineType, SnapshotType, CommandType> {
    constructor();
    private processMetrics;
    private processEventLog;
}

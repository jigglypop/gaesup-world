import { PhysicsConfigType } from '@/core/stores/slices/physics/types';
import { CoreBridge } from '@core/boilerplate';
import { EntityStateManager } from '../core/system/EntityStateManager';
import { PhysicsSystem } from '../core/system/PhysicsSystem';
import { PhysicsUpdateArgs } from '../core/system/PhysicsSystem';
export type PhysicsBridgeEntity = {
    system: PhysicsSystem;
    dispose: () => void;
};
export type PhysicsCommand = {
    type: 'updateConfig';
    data: Partial<PhysicsConfigType>;
};
export type PhysicsSnapshot = ReturnType<PhysicsSystem['getState']> & {
    metrics: ReturnType<PhysicsSystem['getMetrics']>;
};
export declare class PhysicsBridge extends CoreBridge<PhysicsBridgeEntity, PhysicsSnapshot, PhysicsCommand> {
    protected buildEngine(_: string, config: PhysicsConfigType, stateManager?: EntityStateManager): PhysicsBridgeEntity | null;
    protected executeCommand(entity: PhysicsBridgeEntity, command: PhysicsCommand, _id: string): void;
    protected createSnapshot(entity: PhysicsBridgeEntity): PhysicsSnapshot;
    updateEntity(id: string, args: PhysicsUpdateArgs): void;
}

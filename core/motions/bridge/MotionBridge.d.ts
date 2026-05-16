import { RapierRigidBody } from '@react-three/rapier';
import { MotionType } from '@/core/motions/core/system/types';
import { CoreBridge } from '@core/boilerplate';
import { MotionCommand, MotionEntity, MotionSnapshot } from './types';
export declare class MotionBridge extends CoreBridge<MotionEntity, MotionSnapshot, MotionCommand> {
    private tempQuaternion;
    private createEmptySnapshot;
    private getOrCreateSnapshot;
    protected buildEngine(_: string, type: MotionType, rigidBody: RapierRigidBody): MotionEntity | null;
    protected executeCommand(entity: MotionEntity, command: MotionCommand, entityId: string): void;
    protected createSnapshot(entity: MotionEntity, entityId: string): MotionSnapshot;
    getActiveEntities(): string[];
    getRigidBody(entityId: string): RapierRigidBody | undefined;
}

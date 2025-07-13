import { CoreBridge, DomainBridge, EnableEventLog } from '@core/boilerplate';
import { LogSnapshot, ValidateCommand, CacheSnapshot } from '@core/boilerplate';
import { MotionSystem } from '@/core/motions/core/system/MotionSystem';
import { euler, RapierRigidBody, vec3 } from '@react-three/rapier';
import { MotionCommand, MotionEntity, MotionSnapshot } from './types';
import { MotionType } from '@/core/motions/core/system/types';
import { GameStatesType } from '@/core/world/components/Rideable/types';
import { DIContainer } from '@core/boilerplate';

@DomainBridge('motion')
@EnableEventLog()
export class MotionBridge extends CoreBridge<MotionEntity, MotionSnapshot, MotionCommand> {

  protected buildEngine(_: string, type: MotionType, rigidBody: RapierRigidBody): MotionEntity | null {
    if (!type || !rigidBody) return null;
    const system = new MotionSystem({ type });
    DIContainer.getInstance().injectProperties(system);
    return {
      system,
      rigidBody,
      type,
      dispose: () => system.dispose()
    };
  }

  @ValidateCommand()
  protected executeCommand(entity: MotionEntity, command: MotionCommand, _: string): void {
    const { system, rigidBody } = entity;
    switch (command.type) {
      case 'move':
        if (command.data?.movement) {
          system.applyForce(command.data.movement, rigidBody);
        }
        break;
      case 'jump':
        const jumpForce = system.calculateJump({ jumpSpeed: 12 }, {} as GameStatesType);
        if (jumpForce.length() > 0) {
          system.applyForce(jumpForce, rigidBody);
        }
        break;
      case 'stop':
        const vel = rigidBody.linvel();
        rigidBody.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
        break;
      case 'reset':
        system.reset();
        rigidBody.setTranslation({ x: 0, y: 0, z: 0 }, true);
        rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
        break;
    }
  }

  @LogSnapshot()
  @CacheSnapshot(16) // 60fps 캐싱
  protected createSnapshot(entity: MotionEntity, _: string): MotionSnapshot {
    const { system, rigidBody, type } = entity;
    const translation = rigidBody.translation();
    const velocity = rigidBody.linvel();
    const rotation = rigidBody.rotation();
    const snapshot: MotionSnapshot = {
      type,
      position: vec3({ x: translation.x, y: translation.y, z: translation.z }),
      velocity: vec3({ x: velocity.x, y: velocity.y, z: velocity.z }),
      rotation: euler({ x: rotation.x, y: rotation.y, z: rotation.z }),
      isGrounded: system.getState().isGrounded,
      isMoving: system.getState().isMoving,
      speed: system.getState().speed,
      metrics: { ...system.getMetrics() },
      config: { maxSpeed: 10, acceleration: 5, jumpForce: 12 } 
    };
    return snapshot;
  }

  getActiveEntities(): string[] {
    return Array.from(this.engines.keys());
  }

  getRigidBody(entityId: string): RapierRigidBody | undefined {
    return this.getEngine(entityId)?.rigidBody;
  }
}

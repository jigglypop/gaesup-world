import { AbstractBridge } from '@core/boilerplate';
import { MotionEngine } from '@core/motions/core/engine/MotionEngine';
import { euler, RapierRigidBody, vec3 } from '@react-three/rapier';
import { MotionCommand, MotionEntity, MotionSnapshot } from './types';
import { MotionType } from '@core/motions/core/engine/types';
import { GameStatesType } from '@/core/world/components/Rideable/types';

export class MotionBridge extends AbstractBridge<MotionEntity, MotionSnapshot, MotionCommand> {
  protected buildEngine(_: string, type: MotionType, rigidBody: RapierRigidBody): MotionEntity | null {
    if (!type || !rigidBody) return null;
    const engine = new MotionEngine(type);
    return {
      engine,
      rigidBody,
      type,
      dispose: () => engine.dispose()
    };
  }

  protected executeCommand(entity: MotionEntity, command: MotionCommand, _: string): void {
    const { engine, rigidBody } = entity;
    switch (command.type) {
      case 'move':
        if (command.data?.movement) {
          engine.applyForce(command.data.movement, rigidBody);
        }
        break;
      case 'jump':
        const jumpForce = engine.calculateJump({ jumpSpeed: 12 }, {} as GameStatesType);
        if (jumpForce.length() > 0) {
          engine.applyForce(jumpForce, rigidBody);
        }
        break;
      case 'stop':
        const vel = rigidBody.linvel();
        rigidBody.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
        break;
      case 'reset':
        engine.reset();
        rigidBody.setTranslation({ x: 0, y: 0, z: 0 }, true);
        rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
        break;
    }
  }

  protected createSnapshot(entity: MotionEntity, _: string): MotionSnapshot {
    const { engine, rigidBody, type } = entity;
    const translation = rigidBody.translation();
    const velocity = rigidBody.linvel();
    const rotation = rigidBody.rotation();
    const snapshot: MotionSnapshot = {
      type,
      position: vec3({ x: translation.x, y: translation.y, z: translation.z }),
      velocity: vec3({ x: velocity.x, y: velocity.y, z: velocity.z }),
      rotation: euler({ x: rotation.x, y: rotation.y, z: rotation.z }),
      isGrounded: engine.getState().isGrounded,
      isMoving: engine.getState().isMoving,
      speed: engine.getState().speed,
      metrics: { ...engine.getMetrics() },
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

import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { MotionSystem } from '@/core/motions/core/system/MotionSystem';
import { MotionType } from '@/core/motions/core/system/types';
import { GameStatesType } from '@/core/world/components/Rideable/types';
import { ValidateCommand } from '@core/boilerplate';
import { CoreBridge, DomainBridge, EnableEventLog } from '@core/boilerplate';
import { DIContainer } from '@core/boilerplate';

import { MotionCommand, MotionEntity, MotionSnapshot } from './types';

@DomainBridge('motion')
@EnableEventLog()
export class MotionBridge extends CoreBridge<MotionEntity, MotionSnapshot, MotionCommand> {
  private tempQuaternion = new THREE.Quaternion();

  private createEmptySnapshot(type: MotionType): MotionSnapshot {
    return {
      type,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      isGrounded: false,
      isMoving: false,
      speed: 0,
      metrics: {
        currentSpeed: 0,
        averageSpeed: 0,
        totalDistance: 0,
        frameTime: 0,
        isAccelerating: false,
      },
      config: { maxSpeed: 10, acceleration: 5, jumpForce: 12 }
    };
  }

  private getOrCreateSnapshot(entityId: string, type: MotionType): MotionSnapshot {
    const cached = this.getCachedSnapshot(entityId) as MotionSnapshot | undefined;
    if (cached) return cached;
    const created = this.createEmptySnapshot(type);
    this.cacheSnapshot(entityId, created);
    return created;
  }

  protected buildEngine(_: string, type: MotionType, rigidBody: RapierRigidBody): MotionEntity | null {
    void _;
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
  protected executeCommand(entity: MotionEntity, command: MotionCommand, entityId: string): void {
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
      case 'setConfig': {
        const config = command.data?.config;
        if (!config) break;
        const snapshot = this.getOrCreateSnapshot(entityId, entity.type);
        Object.assign(snapshot.config, config);
        break;
      }
    }
  }

  protected createSnapshot(entity: MotionEntity, entityId: string): MotionSnapshot {
    const { system, rigidBody, type } = entity;

    const snapshot = this.getOrCreateSnapshot(entityId, type);

    // Update hot fields in-place to avoid per-snapshot allocations.
    snapshot.type = type;

    const t = rigidBody.translation();
    snapshot.position.set(t.x, t.y, t.z);

    const v = rigidBody.linvel();
    snapshot.velocity.set(v.x, v.y, v.z);

    const r = rigidBody.rotation();
    this.tempQuaternion.set(r.x, r.y, r.z, r.w);
    snapshot.rotation.setFromQuaternion(this.tempQuaternion);

    const state = system.getState();
    snapshot.isGrounded = state.isGrounded;
    snapshot.isMoving = state.isMoving;
    snapshot.speed = state.speed;

    const metrics = system.getMetrics();
    snapshot.metrics.currentSpeed = metrics.currentSpeed;
    snapshot.metrics.averageSpeed = metrics.averageSpeed;
    snapshot.metrics.totalDistance = metrics.totalDistance;
    snapshot.metrics.frameTime = metrics.frameTime;
    snapshot.metrics.isAccelerating = metrics.isAccelerating;

    // Keep AbstractBridge's snapshot cache in sync even when callers use snapshot() directly.
    this.cacheSnapshot(entityId, snapshot);
    return snapshot;
  }

  getActiveEntities(): string[] {
    return Array.from(this.engines.keys());
  }

  getRigidBody(entityId: string): RapierRigidBody | undefined {
    return this.getEngine(entityId)?.rigidBody;
  }
}

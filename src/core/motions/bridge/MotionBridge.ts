import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { MotionSystem } from '@/core/motions/core/system/MotionSystem';
import { MotionType } from '@/core/motions/core/system/types';
import { GameStatesType } from '@/core/world/components/Rideable/types';
import { ValidateCommand } from '@core/boilerplate';
import { CoreBridge, DomainBridge, EnableEventLog } from '@core/boilerplate';
import { DIContainer } from '@core/boilerplate';

import { MotionCommand, MotionEntity, MotionSnapshot } from './types';

const GROUNDED_VERTICAL_SPEED = 0.25;

function createCommandGameStates(): GameStatesType {
  return {
    canRide: false,
    isRiding: false,
    isJumping: false,
    isFalling: false,
    isMoving: false,
    isRunning: false,
    isNotMoving: true,
    isNotRunning: true,
    isOnTheGround: true,
  };
}

@DomainBridge('motion')
@EnableEventLog()
export class MotionBridge extends CoreBridge<MotionEntity, MotionSnapshot, MotionCommand> {
  private tempQuaternion = new THREE.Quaternion();
  private readonly commandGameStates = createCommandGameStates();
  private readonly syncPosition = new THREE.Vector3();
  private readonly syncVelocity = new THREE.Vector3();
  private playerEntityId: string | null = null;

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
      grounded: null,
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
      case 'jump': {
        this.syncEntity(entity);
        const jumpSpeed = this.getOrCreateSnapshot(entityId, entity.type).config.jumpForce;
        const jumpForce = system.calculateJump({ jumpSpeed }, this.commandGameStates);
        if (jumpForce.length() > 0) {
          system.applyForce(jumpForce, rigidBody);
        }
        break;
      }
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

    snapshot.type = type;

    const t = rigidBody.translation();
    snapshot.position.set(t.x, t.y, t.z);

    const v = rigidBody.linvel();
    snapshot.velocity.set(v.x, v.y, v.z);

    const r = rigidBody.rotation();
    this.tempQuaternion.set(r.x, r.y, r.z, r.w);
    snapshot.rotation.setFromQuaternion(this.tempQuaternion);

    system.syncFromBody(snapshot.position, snapshot.velocity, this.resolveGrounded(entity, v.y));
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

    this.cacheSnapshot(entityId, snapshot);
    return snapshot;
  }

  reportGrounded(entityId: string, grounded: boolean): void {
    const entity = this.getEngine(entityId);
    if (entity) entity.grounded = grounded;
  }

  private resolveGrounded(entity: MotionEntity, verticalVelocity: number): boolean {
    return entity.grounded ?? Math.abs(verticalVelocity) < GROUNDED_VERTICAL_SPEED;
  }

  private syncEntity(entity: MotionEntity): void {
    const t = entity.rigidBody.translation();
    const v = entity.rigidBody.linvel();
    this.syncPosition.set(t.x, t.y, t.z);
    this.syncVelocity.set(v.x, v.y, v.z);
    entity.system.syncFromBody(this.syncPosition, this.syncVelocity, this.resolveGrounded(entity, v.y));
  }

  setPlayerEntity(entityId: string | null): void {
    this.playerEntityId = entityId;
  }

  getPlayerEntityId(): string | null {
    if (this.playerEntityId !== null && this.engines.has(this.playerEntityId)) return this.playerEntityId;
    if (this.playerEntityId !== null) return null;
    for (const id of this.engines.keys()) return id;
    return null;
  }

  override unregister(id: string): void {
    super.unregister(id);
    if (this.playerEntityId === id) this.playerEntityId = null;
  }

  getActiveEntities(): string[] {
    return Array.from(this.engines.keys());
  }

  getRigidBody(entityId: string): RapierRigidBody | undefined {
    return this.getEngine(entityId)?.rigidBody;
  }
}

import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { BridgeFactory } from '@core/boilerplate';

import { MotionBridge } from '../bridge/MotionBridge';
import { MotionCommand, MotionSnapshot, MotionConfig } from '../bridge/types';
import { MotionType } from '../core/system/types';

export class ManagedMotionEntity {
  private readonly id: string;
  private readonly bridge: MotionBridge;
  private readonly motionType: MotionType;
  private rigidBody: RapierRigidBody | null = null;
  private targetPosition: THREE.Vector3 | null = null;
  private isAutomated = false;
  private unsubscribe: (() => void) | null = null;

  constructor(id: string, motionType: MotionType, bridge?: MotionBridge | null) {
    this.id = id;
    this.bridge =
      bridge ??
      (BridgeFactory.get('motion') as MotionBridge | null) ??
      (BridgeFactory.create('motion') as MotionBridge | null) ??
      (() => {
        throw new Error(`[ManagedMotionEntity] MotionBridge not available for id: ${id}`);
      })();
    this.motionType = motionType;
  }

  public initialize(): void {
    if (this.unsubscribe) return;
    this.unsubscribe = this.bridge.subscribe((snapshot, entityId) => {
      if (entityId !== this.id) return;
      if (this.isAutomated && this.targetPosition) {
        this.handleAutomatedMovement(snapshot);
      }
    });
  }

  public setRigidBody(rigidBody: RapierRigidBody): void {
    this.rigidBody = rigidBody;
    this.bridge.register(this.id, this.motionType, rigidBody);
  }

  private execute(command: MotionCommand): void {
    this.bridge.execute(this.id, command);
  }

  public move(movement: THREE.Vector3): void {
    this.execute({ type: 'move', data: { movement } });
  }

  public jump(): void {
    this.execute({ type: 'jump' });
  }

  public stop(): void {
    this.execute({ type: 'stop' });
  }

  public turn(direction: number): void {
    this.execute({ type: 'turn', data: { direction } });
  }

  public reset(): void {
    this.execute({ type: 'reset' });
  }

  public setConfig(config: MotionConfig): void {
    this.execute({ type: 'setConfig', data: { config } });
  }

  public enableAutomation(targetPosition: THREE.Vector3): void {
    this.isAutomated = true;
    this.targetPosition = targetPosition;
  }

  public disableAutomation(): void {
    this.isAutomated = false;
    this.targetPosition = null;
  }

  private handleAutomatedMovement(snapshot: MotionSnapshot): void {
    if (!this.targetPosition || !this.rigidBody) return;

    const currentPosition = snapshot.position;
    const direction = new THREE.Vector3()
      .subVectors(this.targetPosition, currentPosition)
      .normalize();

    const distance = currentPosition.distanceTo(this.targetPosition);
    if (distance < 0.5) {
      this.stop();
      this.disableAutomation();
    } else {
      const speed = Math.min(distance * 2, snapshot.config.maxSpeed);
      const movement = direction.multiplyScalar(speed);
      this.move(movement);
    }
  }

  public getMotionType(): MotionType {
    return this.motionType;
  }

  public getSnapshot(): MotionSnapshot | null {
    return this.bridge.snapshot(this.id);
  }

  public isGrounded(): boolean {
    return this.getSnapshot()?.isGrounded ?? false;
  }

  public isMoving(): boolean {
    return this.getSnapshot()?.isMoving ?? false;
  }

  public getSpeed(): number {
    return this.getSnapshot()?.speed ?? 0;
  }

  public dispose(): void {
    this.stop();
    this.disableAutomation();
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.bridge.unregister(this.id);
  }
} 
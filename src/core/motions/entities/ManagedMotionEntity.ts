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
  private latestSnapshot: MotionSnapshot | null = null;
  private tempDirection = new THREE.Vector3();

  constructor(id: string, motionType: MotionType, bridge?: MotionBridge | null) {
    this.id = id;
    this.bridge =
      bridge ??
      (BridgeFactory.getOrCreate('motion') as MotionBridge | null) ??
      (() => {
        throw new Error(`[ManagedMotionEntity] MotionBridge not available for id: ${id}`);
      })();
    this.motionType = motionType;
  }

  public initialize(): void {
    if (this.unsubscribe) return;
    this.unsubscribe = this.bridge.subscribe((snapshot, entityId) => {
      if (entityId !== this.id) return;
      if (snapshot) {
        this.latestSnapshot = snapshot;
      }
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
    const dx = this.targetPosition.x - currentPosition.x;
    const dy = this.targetPosition.y - currentPosition.y;
    const dz = this.targetPosition.z - currentPosition.z;
    const distanceSq = dx * dx + dy * dy + dz * dz;

    // Avoid sqrt when we're already within the stop threshold.
    if (distanceSq < 0.5 * 0.5) {
      this.stop();
      this.disableAutomation();
    } else {
      const distance = Math.sqrt(distanceSq);
      const speed = Math.min(distance * 2, snapshot.config.maxSpeed);
      const invLen = distance > 0 ? 1 / distance : 0;
      this.tempDirection.set(dx * invLen * speed, dy * invLen * speed, dz * invLen * speed);
      this.move(this.tempDirection);
    }
  }

  public getMotionType(): MotionType {
    return this.motionType;
  }

  public getSnapshot(): MotionSnapshot | null {
    if (this.latestSnapshot) return this.latestSnapshot;

    const cached = this.bridge.getCachedSnapshot(this.id) as MotionSnapshot | undefined;
    if (cached) {
      this.latestSnapshot = cached;
      return cached;
    }

    const snapshot = this.bridge.snapshot(this.id);
    if (snapshot) this.latestSnapshot = snapshot;
    return snapshot;
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
    this.latestSnapshot = null;
    this.bridge.unregister(this.id);
  }
} 
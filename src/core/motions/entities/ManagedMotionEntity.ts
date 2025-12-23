import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { ManagedEntity, Autowired } from '@core/boilerplate';

import { MotionBridge } from '../bridge/MotionBridge';
import { MotionCommand, MotionEntity, MotionSnapshot, MotionConfig } from '../bridge/types';
import { MotionType } from '../core/system/types';

export class ManagedMotionEntity extends ManagedEntity<MotionEntity, MotionSnapshot, MotionCommand> {
  @Autowired()
  protected bridge!: MotionBridge;

  private motionType: MotionType;
  private rigidBody: RapierRigidBody | null = null;
  private targetPosition: THREE.Vector3 | null = null;
  private isAutomated = false;

  constructor(id: string, motionType: MotionType) {
    super(id);
    this.motionType = motionType;
  }

  public initialize(): void {
    super.initialize();
    this.subscribe((snapshot) => {
      if (this.isAutomated && this.targetPosition) {
        this.handleAutomatedMovement(snapshot);
      }
    });
  }

  public setRigidBody(rigidBody: RapierRigidBody): void {
    this.rigidBody = rigidBody;
    this.bridge.register(this.id, this.motionType, rigidBody);
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
    return this.snapshot();
  }

  public isGrounded(): boolean {
    return this.snapshot()?.isGrounded ?? false;
  }

  public isMoving(): boolean {
    return this.snapshot()?.isMoving ?? false;
  }

  public getSpeed(): number {
    return this.snapshot()?.speed ?? 0;
  }

  public dispose(): void {
    this.stop();
    this.disableAutomation();
    super.dispose();
  }
} 
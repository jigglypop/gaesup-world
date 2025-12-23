import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { BaseComponent } from '../BaseComponent';
import { ComponentContext, IForceComponent } from '../types';

export interface GravityForceProperties {
  gravity?: number;
  maxFallSpeed?: number;
  enabled?: boolean;
}

export class GravityForceComponent extends BaseComponent implements IForceComponent {
  private gravity: number;
  private maxFallSpeed: number;
  private force: THREE.Vector3;

  constructor(properties: GravityForceProperties = {}) {
    super('GravityForce');
    this.gravity = properties.gravity ?? -9.81;
    this.maxFallSpeed = properties.maxFallSpeed ?? 50;
    this.force = new THREE.Vector3();
    this.enabled = properties.enabled ?? true;
  }

  protected onInitialize(): void {
    this.force.set(0, this.gravity, 0);
  }

  protected onUpdate(context: ComponentContext): void {
    if (!context.rigidBodyRef.current) return;
    this.applyForce(context.rigidBodyRef.current, context.deltaTime);
  }

  protected onDispose(): void {
    this.force.set(0, 0, 0);
  }

  getForce(): THREE.Vector3 {
    return this.force.clone();
  }

  applyForce(rigidBody: RapierRigidBody, deltaTime: number): void {
    const currentVel = rigidBody.linvel();
    if (currentVel.y > -this.maxFallSpeed) {
      const gravityForce = this.gravity * deltaTime * 60;
      rigidBody.applyImpulse({ x: 0, y: gravityForce, z: 0 }, true);
    }
  }

  setGravity(gravity: number): void {
    this.gravity = gravity;
    this.force.y = gravity;
  }

  getGravity(): number {
    return this.gravity;
  }
} 
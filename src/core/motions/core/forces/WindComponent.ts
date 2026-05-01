import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import type { PhysicsConfigType } from '@stores/slices';

import { ForceComponent } from './ForceComponent';

export class WindComponent extends ForceComponent {
  protected config: PhysicsConfigType;
  private direction: THREE.Vector3;
  private strength: number;

  constructor(
    config: PhysicsConfigType = {},
    direction: THREE.Vector3 | [number, number, number] = [1, 0, 0],
    strength = 0,
  ) {
    super();
    this.config = config;
    this.direction = Array.isArray(direction)
      ? new THREE.Vector3(...direction)
      : direction.clone();
    this.strength = strength;
  }

  public setWind(direction: THREE.Vector3 | [number, number, number], strength: number): void {
    this.direction = Array.isArray(direction)
      ? new THREE.Vector3(...direction)
      : direction.clone();
    this.strength = strength;
  }

  public update(rigidBody: RapierRigidBody, delta: number): void {
    if (this.strength === 0 || delta <= 0) return;
    const force = this.direction.clone().normalize().multiplyScalar(this.strength * delta);
    rigidBody.addForce({ x: force.x, y: force.y, z: force.z }, true);
  }
}
import { RapierRigidBody } from '@react-three/rapier';

import type { PhysicsConfigType } from '@stores/slices';

import { ForceComponent } from './ForceComponent';

export class BuoyancyComponent extends ForceComponent {
  protected config: PhysicsConfigType;
  private waterLevel: number;

  constructor(config: PhysicsConfigType = {}, waterLevel = 0) {
    super();
    this.config = config;
    this.waterLevel = waterLevel;
  }

  public setWaterLevel(waterLevel: number): void {
    this.waterLevel = waterLevel;
  }

  public update(rigidBody: RapierRigidBody, delta: number): void {
    const buoyancy = this.config.buoyancy ?? 0;
    if (buoyancy === 0 || delta <= 0) return;

    const position = rigidBody.translation();
    const submergedDepth = Math.max(0, this.waterLevel - position.y);
    if (submergedDepth === 0) return;

    rigidBody.addForce({ x: 0, y: submergedDepth * buoyancy * delta, z: 0 }, true);
  }
}
import * as THREE from 'three';
export type PhysicsConfigType = {
  angleDelta?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  buoyancy?: number;
  gravityScale?: number;
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  wheelOffset?: number;
  jumpSpeed?: number;
  turnSpeed?: number;
  walkSpeed?: number;
  runSpeed?: number;
  linearDamping?: number;
  jumpGravityScale?: number;
  normalGravityScale?: number;
  airDamping?: number;
  stopDamping?: number;
}

export interface PhysicsSlice {
  physics: PhysicsConfigType;
  setPhysics: (update: Partial<PhysicsConfigType>) => void;
}
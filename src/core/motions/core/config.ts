import type { Vector3 } from 'three';

export type PhysicsConfigType = {
  angleDelta?: Vector3;
  maxAngle?: Vector3;
  buoyancy?: number | undefined;
  gravityScale?: number;
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  wheelOffset?: number | undefined;
  jumpSpeed?: number;
  turnSpeed?: number | undefined;
  walkSpeed?: number;
  runSpeed?: number;
  linearDamping?: number;
  jumpGravityScale?: number;
  normalGravityScale?: number;
  airDamping?: number;
  stopDamping?: number;
  navigationAgentRadius?: number | undefined;
};

export type PhysicsVector = { x: number; y: number; z: number };

export type GroundRayHit = { normalY: number };

export type PhysicsQueryAdapter = {
  castGroundRay: (origin: Readonly<PhysicsVector>, maxDistance: number, out: GroundRayHit) => boolean;
};

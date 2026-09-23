import { Quaternion, Vector3 } from 'three';

import type { PhysicsCalcProps } from '../../types';
import type { PhysicsConfigType } from '../config';

type PhysicsWorld = NonNullable<PhysicsCalcProps['physicsWorld']>;
type RapierRigidBody = NonNullable<PhysicsCalcProps['rigidBodyRef']['current']>;
type RapierCollider = ReturnType<RapierRigidBody['collider']>;
type Point = { x: number; y: number; z: number };

function groupsMatch(first: number, second: number): boolean {
  return ((first >>> 16) & (second & 0xffff)) !== 0 && ((second >>> 16) & (first & 0xffff)) !== 0;
}

/** Ground support comes from solver contacts, never a world-height heuristic. */
export class GroundContactProbe {
  private world: PhysicsWorld | undefined;
  private body: RapierRigidBody | undefined;
  private collider: RapierCollider | undefined;
  private other: RapierCollider | undefined;
  private filter: PhysicsCalcProps['groundContactFilter'];
  private supported = false;
  private solverContact = false;
  private minimumUp = Math.SQRT1_2;
  private tolerance = 0.03;
  private readonly velocity = new Vector3();
  private readonly supportVelocity = new Vector3();
  private readonly normal = new Vector3();
  private readonly point1 = new Vector3();
  private readonly point2 = new Vector3();
  private readonly castDirection = new Vector3(0, -1, 0);
  private readonly zero = new Vector3();
  private readonly rotation = new Quaternion();
  private readonly otherRotation = new Quaternion();
  private readonly supportRay = {
    origin: new Vector3(), dir: new Vector3(),
    pointAt(distance: number) { return this.origin.clone().addScaledVector(this.dir, distance); },
  };

  private pointVelocity(body: RapierRigidBody | null, point: Point, out: Vector3): Vector3 {
    if (!body) return out.set(0, 0, 0);
    const linear = body.linvel(); const angular = body.angvel(); const center = body.worldCom();
    const x = point.x - center.x; const y = point.y - center.y; const z = point.z - center.z;
    return out.set(linear.x + angular.y * z - angular.z * y,
      linear.y + angular.z * x - angular.x * z, linear.z + angular.x * y - angular.y * x);
  }

  private readonly inspectManifold: Parameters<PhysicsWorld['contactPair']>[2] = (manifold, flipped) => {
    if (this.supported || !this.collider || !this.other || manifold.numSolverContacts() === 0) return;
    this.otherRotation.copy(this.other.rotation());
    this.normal.copy(flipped ? manifold.localNormal1() : manifold.localNormal2()).applyQuaternion(this.otherRotation).negate();
    if (-this.normal.y < this.minimumUp) return;
    this.solverContact = true; this.castDirection.copy(this.normal);
    this.rotation.copy(this.collider.rotation());
    const ownPosition = this.collider.translation(); const otherPosition = this.other.translation();
    for (let i = 0; i < manifold.numContacts(); i++) {
      this.normal.copy(this.castDirection);
      if (manifold.contactDist(i) > this.tolerance) continue;
      const own = flipped ? manifold.localContactPoint2(i) : manifold.localContactPoint1(i);
      const support = flipped ? manifold.localContactPoint1(i) : manifold.localContactPoint2(i);
      if (!own || !support) continue;
      this.point1.copy(own).applyQuaternion(this.rotation).add(ownPosition);
      this.point2.copy(support).applyQuaternion(this.otherRotation).add(otherPosition);
      // Reusing a nearby solver witness is both cheaper and more stable than a
      // new GJK query on very large shapes. Teleported witnesses must not qualify.
      if (this.point1.distanceToSquared(this.point2) <= this.tolerance * this.tolerance && this.supportsVelocity()) {
        this.supported = true; return;
      }
      // Tangential motion advances the actor beyond the previous solver witness.
      // Validate that surface point against this collider's current geometry;
      // unlike a global ground ray, this cannot invent support without a solver pair.
      const offset = this.tolerance + Math.max(0, -manifold.contactDist(i));
      this.supportRay.dir.copy(this.castDirection);
      this.supportRay.origin.copy(this.point1).addScaledVector(this.castDirection, -offset);
      const hit = this.other.castRayAndGetNormal(this.supportRay, offset + this.tolerance, false);
      if (hit) {
        this.normal.copy(hit.normal).negate();
        if (-this.normal.y < this.minimumUp) continue;
        // Older Rapier releases expose `toi` instead of `timeOfImpact`.
        const distance = 'timeOfImpact' in hit ? hit.timeOfImpact : (hit as unknown as { toi: number }).toi;
        this.point2.copy(this.supportRay.origin).addScaledVector(this.supportRay.dir, distance);
        if (this.supportsVelocity()) { this.supported = true; return; }
      }
    }
  };

  private supportsVelocity(): boolean {
    if (!this.body || !this.other) return false;
    const own = this.pointVelocity(this.body, this.point1, this.velocity);
    const support = this.pointVelocity(this.other.parent(), this.point2, this.supportVelocity);
    const separatingSpeed = -(own.x - support.x) * this.normal.x
      - (own.y - support.y) * this.normal.y - (own.z - support.z) * this.normal.z;
    return separatingSpeed <= 0.2;
  }

  private readonly inspectOther = (other: RapierCollider): void => {
    if (this.supported || !this.world || !this.body || !this.collider || other.isSensor() || !other.isEnabled()) return;
    if (other.parent()?.isEnabled() === false) return;
    if (this.filter && !this.filter(this.collider, other)) return;
    if (!groupsMatch(this.collider.collisionGroups(), other.collisionGroups())
      || !groupsMatch(this.collider.solverGroups(), other.solverGroups())) return;
    this.other = other; this.solverContact = false;
    this.world.contactPair(this.collider, other, this.inspectManifold);
    if (this.supported || !this.solverContact) return;
    // Recheck the current transforms: a teleport may precede the next physics step.
    const contact = this.collider.contactCollider(other, this.tolerance);
    if (contact && contact.distance <= this.tolerance) {
      this.normal.copy(contact.normal1);
      this.point1.copy(contact.point1); this.point2.copy(contact.point2);
    } else {
      // Rapier's contact query does not support composite shapes such as triangle
      // meshes. A bounded shape cast against this solver candidate does.
      // Rapier 0.12 (React Rapier 1) predates the targetDistance parameter.
      const cast = this.collider.castCollider;
      const hit = cast.length === 5
        ? (cast as unknown as (a: Point, b: RapierCollider, c: Point, d: number, e: boolean) => ReturnType<typeof cast>)
          .call(this.collider, this.castDirection, other, this.zero, this.tolerance, true)
        : cast.call(this.collider, this.castDirection, other, this.zero, 0, this.tolerance, true);
      if (!hit) return;
      this.rotation.copy(this.collider.rotation());
      this.normal.copy(hit.normal1).applyQuaternion(this.rotation);
      this.point1.copy(hit.witness1).applyQuaternion(this.rotation).add(this.collider.translation());
      this.rotation.copy(other.rotation());
      this.point2.copy(hit.witness2).applyQuaternion(this.rotation).add(other.translation());
    }
    if (-this.normal.y < this.minimumUp) return;
    this.supported = this.supportsVelocity();
  };

  read(world: PhysicsWorld | undefined, body: RapierRigidBody, config: PhysicsConfigType, filter?: PhysicsCalcProps['groundContactFilter']): boolean {
    if (!world || !body.isValid() || !body.isEnabled() || world.getRigidBody(body.handle) !== body) return false;
    world.propagateModifiedBodyPositionsToColliders();
    const slope = config.maxGroundSlopeAngle ?? Math.PI / 4;
    const tolerance = config.groundContactTolerance ?? 0.03;
    this.minimumUp = Math.cos(Number.isFinite(slope) ? Math.max(0, Math.min(Math.PI / 2, slope)) : Math.PI / 4);
    this.tolerance = Number.isFinite(tolerance) ? Math.max(0, tolerance) : 0.03;
    this.world = world; this.body = body; this.filter = filter; this.supported = false;
    try {
      for (let i = 0; i < body.numColliders() && !this.supported; i++) {
        const collider = body.collider(i);
        if (collider.isSensor() || !collider.isEnabled()) continue;
        this.collider = collider;
        world.contactPairsWith(collider, this.inspectOther);
      }
      return this.supported;
    } finally { this.world = undefined; this.body = undefined; this.collider = undefined; this.other = undefined; this.filter = undefined; }
  }
}

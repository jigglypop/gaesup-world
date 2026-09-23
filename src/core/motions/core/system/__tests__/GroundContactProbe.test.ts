import { createRequire } from 'node:module';

import type { RapierContext } from '@react-three/rapier';
import { Quaternion, Vector3 } from 'three';

import { GroundContactProbe } from '../GroundContactProbe';

// Resolve the physics implementation used by the installed React binding, not a mock.
const R = createRequire(require.resolve('@react-three/rapier'))('@dimforge/rapier3d-compat') as RapierContext['rapier'];
const worlds: RapierContext['world'][] = [];
const makeWorld = () => {
  const world = new R.World({ x: 0, y: 0, z: 0 });
  world.timestep = 1 / 60;
  worlds.push(world);
  return world;
};

function support(angle = 0, sensor = false, moving = false) {
  const world = makeWorld();
  const normal = new Vector3(-Math.sin(angle), Math.cos(angle), 0);
  const platform = world.createRigidBody((moving ? R.RigidBodyDesc.kinematicVelocityBased() : R.RigidBodyDesc.fixed())
    .setTranslation(0, 10, 0).setRotation(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), angle)));
  const floor = world.createCollider(R.ColliderDesc.cuboid(4, 0.25, 4).setSensor(sensor), platform);
  const center = normal.multiplyScalar(0.5 + 0.25 * normal.y - 0.002).add(new Vector3(0, 10, 0));
  const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(center.x, center.y, center.z).lockRotations());
  const collider = world.createCollider(R.ColliderDesc.capsule(0.25, 0.25), body);
  world.step();
  const probe = new GroundContactProbe();
  const grounded = () => probe.read(world, body, {});
  return { world, platform, floor, body, collider, probe, grounded };
}

beforeAll(async () => { await R.init(); });
afterEach(() => { worlds.splice(0).forEach(world => world.free()); });

describe('GroundContactProbe with real Rapier solver contacts', () => {
  it('uses contacts at elevated positions and retains sleeping support', () => {
    const f = support();
    expect(f.grounded()).toBe(true);
    f.body.sleep();
    expect(f.grounded()).toBe(true);
  });

  it.each([0.5, 10])('does not infer support from a stationary body at y=%s', height => {
    const world = makeWorld();
    const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(0, height, 0));
    world.createCollider(R.ColliderDesc.capsule(0.25, 0.25), body);
    world.step();
    expect(new GroundContactProbe().read(world, body, {})).toBe(false);
  });

  it('rejects sensors and collision pairs with solver groups disabled', () => {
    expect(support(0, true).grounded()).toBe(false);
    const f = support();
    f.floor.setSolverGroups(0);
    f.world.step();
    expect(f.grounded()).toBe(false);
  });

  it('accepts gentle slopes and applies the configured maximum slope', () => {
    expect(support(Math.PI / 9).grounded()).toBe(true);
    const steep = support(Math.PI / 3);
    expect(steep.grounded()).toBe(false);
    expect(steep.probe.read(steep.world, steep.body, { maxGroundSlopeAngle: 70 * Math.PI / 180 })).toBe(true);
  });

  it.each([Math.PI / 2, Math.PI])('rejects wall/ceiling contact at angle %s', angle => {
    expect(support(angle).grounded()).toBe(false);
  });

  it('uses velocity relative to the moving support and clears support at jump takeoff', () => {
    const f = support(0, false, true);
    f.platform.setLinvel({ x: 0, y: 2, z: 0 }, true);
    f.body.setLinvel({ x: 0, y: 2, z: 0 }, true);
    expect(f.grounded()).toBe(true);
    f.body.setLinvel({ x: 0, y: 5, z: 0 }, true);
    expect(f.grounded()).toBe(false);
  });

  it.each(['actor', 'platform'] as const)('rejects stale %s contacts immediately after teleport, before another step', target => {
    const f = support();
    expect(f.grounded()).toBe(true);
    const body = target === 'actor' ? f.body : f.platform;
    body.setTranslation({ x: 100, y: body.translation().y, z: 0 }, true);
    expect(f.grounded()).toBe(false);
  });

  it('drops removed or disabled supports and disabled actors', () => {
    const removed = support();
    removed.world.removeRigidBody(removed.platform);
    expect(removed.grounded()).toBe(false);
    const disabled = support();
    disabled.floor.setEnabled(false);
    expect(disabled.grounded()).toBe(false);
    const platform = support();
    platform.platform.setEnabled(false);
    expect(platform.grounded()).toBe(false);
    const actor = support();
    actor.body.setEnabled(false);
    expect(actor.grounded()).toBe(false);
  });

  it('isolates worlds even when their numeric body handles overlap', () => {
    const a = support(); const b = support();
    expect(a.body.handle).toBe(b.body.handle);
    expect(a.probe.read(b.world, a.body, {})).toBe(false);
    expect(a.probe.read(undefined, a.body, {})).toBe(false);
    expect(a.grounded()).toBe(true);
  });

  it('finds a supporting solid collider when another actor collider is a sensor', () => {
    const f = support();
    f.collider.setSensor(true);
    f.world.createCollider(R.ColliderDesc.capsule(0.25, 0.25), f.body);
    f.world.step();
    expect(f.grounded()).toBe(true);
  });

  it('supports triangle-mesh terrain', () => {
    const world = makeWorld();
    world.createCollider(R.ColliderDesc.trimesh(
      new Float32Array([-4, 10, -4, -4, 10, 4, 4, 10, -4, 4, 10, 4]),
      new Uint32Array([0, 1, 2, 2, 1, 3]),
    ));
    const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(0, 10.499, 0).lockRotations());
    world.createCollider(R.ColliderDesc.capsule(0.25, 0.25), body);
    world.step();
    expect(new GroundContactProbe().read(world, body, {})).toBe(true);
    body.setTranslation({ x: 100, y: 10.499, z: 0 }, true);
    expect(new GroundContactProbe().read(world, body, {})).toBe(false);
  });

  it('does not carry old floor support onto a wall of the same mesh after teleport', () => {
    const world = makeWorld();
    world.createCollider(R.ColliderDesc.trimesh(
      new Float32Array([-4,10,-4,-4,10,4,4,10,-4,4,10,4,2,10,-4,2,14,-4,2,10,4,2,14,4]),
      new Uint32Array([0,1,2,2,1,3,4,6,5,5,6,7]),
    ));
    const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(0, 10.499, 0).lockRotations());
    world.createCollider(R.ColliderDesc.capsule(0.25, 0.25), body); world.step();
    const probe = new GroundContactProbe();
    expect(probe.read(world, body, {})).toBe(true);
    body.setTranslation({ x: 1.751, y: 12, z: 0 }, true);
    expect(probe.read(world, body, {})).toBe(false);
  });

  it.each([null, 0])('shares the custom contact policy when solver hooks return %s', flag => {
    const f = support();
    f.collider.setActiveHooks(R.ActiveHooks.FILTER_CONTACT_PAIRS);
    f.body.wakeUp();
    const queue = new R.EventQueue(true); const filterContactPair = jest.fn(() => flag);
    try { f.world.step(queue, { filterContactPair, filterIntersectionPair: () => false }); }
    finally { queue.free(); }
    expect(filterContactPair).toHaveBeenCalled();
    // Rapier exposes no public manifold solverFlags getter. EMPTY may retain
    // solver contacts; callers share that policy through groundContactFilter.
    if (flag === null) expect(f.grounded()).toBe(false);
    expect(f.probe.read(f.world, f.body, {}, () => false)).toBe(false);
  });

  it('uses angular support velocity at the contact and handles reversed collider creation order', () => {
    const world = makeWorld();
    const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(2, 10.749, 0).lockRotations());
    world.createCollider(R.ColliderDesc.capsule(0.25, 0.25), body);
    const platform = world.createRigidBody(R.RigidBodyDesc.kinematicVelocityBased().setTranslation(0, 10, 0));
    world.createCollider(R.ColliderDesc.cuboid(4, 0.25, 4), platform);
    world.step();
    const probe = new GroundContactProbe();
    expect(probe.read(world, body, {})).toBe(true);
    platform.setAngvel({ x: 0, y: 0, z: 1 }, true);
    body.setLinvel({ x: -0.25, y: 2, z: 0 }, true);
    expect(probe.read(world, body, {})).toBe(true);
    body.setLinvel({ x: -0.25, y: 4, z: 0 }, true);
    expect(probe.read(world, body, {})).toBe(false);
  });

  it('retains solver support on a large floor at distant coordinates', () => {
    const world = makeWorld();
    world.createCollider(R.ColliderDesc.cuboid(2000, 0.25, 4).setTranslation(0, 9.75, 0));
    const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(-996, 10.499, 0).lockRotations());
    world.createCollider(R.ColliderDesc.capsule(0.25, 0.25), body);
    world.step();
    expect(new GroundContactProbe().read(world, body, {})).toBe(true);
  });

  it('retains support while moving across a large floor', () => {
    const world = makeWorld(); world.gravity.y = -9.81;
    world.createCollider(R.ColliderDesc.cuboid(2000, 0.25, 4).setTranslation(0, 9.75, 0));
    const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(-995, 10.499, 0).lockRotations());
    world.createCollider(R.ColliderDesc.capsule(0.25, 0.25), body);
    const probe = new GroundContactProbe();
    for (let i = 0; i < 60; i++) world.step();
    for (let i = 0; i < 120; i++) {
      body.setLinvel({ x: 10, y: body.linvel().y, z: 0 }, true); world.step();
      expect(probe.read(world, body, {})).toBe(true);
    }
  });
});

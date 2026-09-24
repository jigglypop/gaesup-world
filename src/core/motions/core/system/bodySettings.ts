import type { RapierRigidBody } from '@react-three/rapier';

type AppliedBodySettings = { linearDamping: number; rotationMask: number; gravityScale: number };

// Per-tick mode settings rarely change; skip the WASM call when the body already has the value.
const applied = new WeakMap<RapierRigidBody, AppliedBodySettings>();

function settingsFor(body: RapierRigidBody): AppliedBodySettings {
  let settings = applied.get(body);
  if (!settings) {
    settings = { linearDamping: Number.NaN, rotationMask: -1, gravityScale: Number.NaN };
    applied.set(body, settings);
  }
  return settings;
}

export function applyLinearDamping(body: RapierRigidBody, value: number): void {
  const settings = settingsFor(body);
  if (settings.linearDamping === value) return;
  settings.linearDamping = value;
  body.setLinearDamping(value);
}

export function applyEnabledRotations(body: RapierRigidBody, x: boolean, y: boolean, z: boolean): void {
  const settings = settingsFor(body);
  const mask = (x ? 1 : 0) | (y ? 2 : 0) | (z ? 4 : 0);
  if (settings.rotationMask === mask) return;
  settings.rotationMask = mask;
  body.setEnabledRotations(x, y, z, false);
}

export function applyGravityScale(body: RapierRigidBody, value: number): void {
  const settings = settingsFor(body);
  if (settings.gravityScale === value) return;
  settings.gravityScale = value;
  body.setGravityScale(value, false);
}

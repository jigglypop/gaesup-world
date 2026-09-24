/** The Rapier body methods these helpers touch; structural so Layer 1 stays free of the Rapier binding. */
export type BodySettingsTarget = {
  setLinearDamping(value: number): void;
  setEnabledRotations(x: boolean, y: boolean, z: boolean, wakeUp: boolean): void;
  setGravityScale(value: number, wakeUp: boolean): void;
};

type AppliedBodySettings = { linearDamping: number; rotationMask: number; gravityScale: number };

// Per-tick mode settings rarely change; skip the WASM call when the body already has the value.
const applied = new WeakMap<BodySettingsTarget, AppliedBodySettings>();

function settingsFor(body: BodySettingsTarget): AppliedBodySettings {
  let settings = applied.get(body);
  if (!settings) {
    settings = { linearDamping: Number.NaN, rotationMask: -1, gravityScale: Number.NaN };
    applied.set(body, settings);
  }
  return settings;
}

export function applyLinearDamping(body: BodySettingsTarget, value: number): void {
  const settings = settingsFor(body);
  if (settings.linearDamping === value) return;
  settings.linearDamping = value;
  body.setLinearDamping(value);
}

export function applyEnabledRotations(body: BodySettingsTarget, x: boolean, y: boolean, z: boolean): void {
  const settings = settingsFor(body);
  const mask = (x ? 1 : 0) | (y ? 2 : 0) | (z ? 4 : 0);
  if (settings.rotationMask === mask) return;
  settings.rotationMask = mask;
  body.setEnabledRotations(x, y, z, false);
}

export function applyGravityScale(body: BodySettingsTarget, value: number): void {
  const settings = settingsFor(body);
  if (settings.gravityScale === value) return;
  settings.gravityScale = value;
  body.setGravityScale(value, false);
}

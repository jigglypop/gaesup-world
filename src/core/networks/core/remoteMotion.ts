import * as THREE from 'three';

import { weightFromDistance } from '../../utils/sfe';
import type { PlayerState } from '../types';

/** What a remote avatar renders from. The object is replaced only when one of its fields changes. */
export type RemoteAppearance = {
  readonly name: string;
  readonly color: string;
  /** The peer's animation, or run/idle chosen from its speed when it sends none. */
  readonly animation: string;
  readonly modelUrl: string | undefined;
};

/**
 * Network targets and smoothed pose of one remote avatar. Network messages write the targets
 * directly, so a transform-only update never reaches React; the frame channel reads them.
 */
export type RemoteMotion = {
  source: PlayerState | null;
  appearance: RemoteAppearance;
  readonly target: THREE.Vector3;
  readonly targetRotation: THREE.Quaternion;
  readonly velocity: THREE.Vector3;
  receivedAt: number;
  readonly position: THREE.Vector3;
  readonly rotation: THREE.Quaternion;
  readonly smoothVelocity: THREE.Vector3;
  lodAccum: number;
  lodInterval: number;
};

export const DEFAULT_REMOTE_VELOCITY_THRESHOLD = 0.5;
const MAX_PREDICTION_S = 0.12;
const SNAP_DISTANCE = 10;
const SNAP_ELAPSED_S = 0.25;
/** World units per second; effectively no clamp, but avoids blow-ups after stalls. */
const MAX_SPEED = 120;

// Scratch shared by every avatar: the frame channel steps them one at a time.
const predicted = new THREE.Vector3();
const change = new THREE.Vector3();
const step = new THREE.Vector3();
const adjustedTarget = new THREE.Vector3();
const toTarget = new THREE.Vector3();
const overshoot = new THREE.Vector3();

export function createRemoteMotion(): RemoteMotion {
  return {
    source: null,
    appearance: { name: '', color: '', animation: 'idle', modelUrl: undefined },
    target: new THREE.Vector3(),
    targetRotation: new THREE.Quaternion(),
    velocity: new THREE.Vector3(),
    receivedAt: 0,
    position: new THREE.Vector3(),
    rotation: new THREE.Quaternion(),
    smoothVelocity: new THREE.Vector3(),
    lodAccum: 0,
    lodInterval: 0,
  };
}

function fallbackAnimation(previous: string, speed: number, runThreshold: number): string {
  // Hysteresis keeps a player near the threshold from flickering between run and idle.
  if (previous === 'run') return speed < runThreshold * 0.6 ? 'idle' : 'run';
  return speed > runThreshold ? 'run' : 'idle';
}

/**
 * Writes a network state into the targets; the first state also places the avatar.
 * Idempotent per state object. Returns true only when the appearance changed.
 */
export function syncRemoteMotion(motion: RemoteMotion, state: PlayerState, velocityThreshold: number): boolean {
  if (motion.source === state) return false;
  const placed = motion.source !== null;
  motion.source = state;
  motion.receivedAt = performance.now();
  motion.target.set(state.position[0], state.position[1], state.position[2]);
  const [w, x, y, z] = state.rotation;
  motion.targetRotation.set(x, y, z, w);
  if (state.velocity) motion.velocity.set(state.velocity[0], state.velocity[1], state.velocity[2]);
  if (!placed) {
    motion.position.copy(motion.target);
    motion.rotation.copy(motion.targetRotation);
  }

  const current = motion.appearance;
  const animation = state.animation?.trim()
    || fallbackAnimation(current.animation, motion.velocity.length(), velocityThreshold);
  if (current.name === state.name && current.color === state.color
    && current.animation === animation && current.modelUrl === state.modelUrl) return false;
  motion.appearance = { name: state.name, color: state.color, animation, modelUrl: state.modelUrl };
  return true;
}

/** Unity's SmoothDamp (critically damped spring) for a Vector3, updating `current` in place. */
function smoothDamp(
  current: THREE.Vector3,
  target: THREE.Vector3,
  velocity: THREE.Vector3,
  smoothTime: number,
  deltaTime: number,
): void {
  const st = Math.max(0.0001, smoothTime);
  const dt = Math.max(0, deltaTime);
  const omega = 2 / st;
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  change.copy(current).sub(target);
  // Clamp maximum change (prevents extreme overshoot after long stalls).
  const maxChange = MAX_SPEED * st;
  const changeLength = change.length();
  if (changeLength > maxChange && changeLength > 0) change.multiplyScalar(maxChange / changeLength);
  adjustedTarget.copy(current).sub(change);

  step.copy(velocity).addScaledVector(change, omega).multiplyScalar(dt);
  velocity.addScaledVector(step, -omega).multiplyScalar(exp);

  toTarget.copy(target).sub(current);
  current.copy(change).add(step).multiplyScalar(exp).add(adjustedTarget);
  // Prevent overshooting the target.
  if (toTarget.dot(overshoot.copy(current).sub(target)) > 0) {
    current.copy(target);
    velocity.set(0, 0, 0);
  }
}

/**
 * Moves the smoothed pose toward the network target. Distant avatars step less often, with the
 * skipped time carried into the next step; returns false when this frame was skipped.
 */
export function stepRemoteMotion(
  motion: RemoteMotion,
  delta: number,
  camera: THREE.Vector3,
  interpolationSpeed: number,
): boolean {
  motion.lodAccum += Math.max(0, delta);
  if (motion.lodAccum < motion.lodInterval) return false;
  const elapsed = motion.lodAccum;
  motion.lodAccum = 0;

  // SFE-style suppression w = exp(-sigma(distance)) picks the next step interval.
  const weight = weightFromDistance(camera.distanceTo(motion.position), 25, 140, 4);
  motion.lodInterval = weight >= 0.7 ? 0 : weight >= 0.4 ? 1 / 30 : weight >= 0.2 ? 1 / 15 : 1 / 8;

  // Short prediction hides network jitter.
  const sinceNet = (performance.now() - motion.receivedAt) / 1000;
  predicted.copy(motion.target).addScaledVector(motion.velocity, Math.max(0, Math.min(MAX_PREDICTION_S, sinceNet)));

  // Higher interpolationSpeed means a shorter time constant.
  const base = Math.max(0.01, Math.min(0.9, interpolationSpeed));
  const smoothTime = Math.max(0.03, Math.min(0.22, 0.03 + (1 - base) * 0.19));

  // Snap on teleports, missed packets or long frame stalls.
  if (motion.position.distanceTo(predicted) > SNAP_DISTANCE || elapsed > SNAP_ELAPSED_S) {
    motion.position.copy(predicted);
    motion.smoothVelocity.set(0, 0, 0);
    motion.rotation.copy(motion.targetRotation);
    return true;
  }
  smoothDamp(motion.position, predicted, motion.smoothVelocity, smoothTime, elapsed);
  // Exponential rotation smoothing stays stable across frame rates.
  const rotationTime = Math.max(0.025, smoothTime * 0.7);
  motion.rotation.slerp(motion.targetRotation, 1 - Math.exp(-elapsed / rotationTime));
  return true;
}

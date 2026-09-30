import { useEffect } from 'react';

import { TRAIL, TrailField } from './trail';
import { useSharedFrame, type SharedFrameChannel } from '../../runtime/frame';
import { useGaesupRuntime } from '../../runtime/runtimeContext';
import type { GaesupRuntime } from '../../runtime/types';

const TRAIL_FRAME: SharedFrameChannel = { phase: 'effects', label: 'building:trail' };
/** Seconds between fades and how much of 255 each lifts: an untouched print is gone in about a minute and a half. */
const FADE = { every: 1.5, amount: 4 } as const;
/** Seconds between texture uploads while prints change. */
const UPLOAD_EVERY = 0.1;
/** Farther than this between frames is a teleport, not a step (m). */
const LEAP = 3;

type Walker = { x: number; z: number; foot: number };

/** One world's trail: the player's and the residents' steps pressed into a shared field. */
class TrailTracker {
  readonly field = new TrailField();
  private readonly walkers = new Map<string, Walker>();
  private frame = Number.NaN;
  private faded = 0;
  private uploaded = 0;
  private fading = false;
  private readers = 0;

  constructor(private readonly runtime: GaesupRuntime) {}

  /** Runs once per frame, whichever reader calls first. */
  update(elapsed: number): void {
    if (elapsed === this.frame) return;
    this.frame = elapsed;
    const { motionBridge, npcStore, npcSimulation } = this.runtime;
    const id = motionBridge.getPlayerEntityId();
    const player = id ? motionBridge.snapshot(id) : null;
    if (player) {
      this.field.follow(player.position.x, player.position.z);
      if (player.isGrounded) this.walk('player', player.position.x, player.position.z);
    }
    for (const npc of npcStore.getState().instances.keys()) {
      const pose = npcSimulation.getPose(npc);
      if (pose) this.walk(npc, pose.position[0], pose.position[2]);
    }
    if (this.fading && elapsed - this.faded > FADE.every) {
      this.faded = elapsed;
      this.fading = this.field.fade(FADE.amount);
    }
    if (this.field.dirty && elapsed - this.uploaded > UPLOAD_EVERY) {
      this.uploaded = elapsed;
      this.field.dirty = false;
      this.field.texture.needsUpdate = true;
    }
  }

  /** The texture's GPU copy lives while someone draws with it. */
  retain(): () => void {
    this.readers += 1;
    return () => {
      this.readers -= 1;
      if (this.readers === 0) this.field.dispose();
    };
  }

  /** A print every stride, feet alternating either side of the line walked. */
  private walk(id: string, x: number, z: number): void {
    const walker = this.walkers.get(id);
    if (!walker) {
      this.walkers.set(id, { x, z, foot: 1 });
      return;
    }
    const dx = x - walker.x, dz = z - walker.z, distance = Math.hypot(dx, dz);
    if (distance < TRAIL.stride) return;
    walker.x = x;
    walker.z = z;
    if (distance > LEAP) return;
    walker.foot = -walker.foot;
    const side = (TRAIL.gait * walker.foot) / distance;
    this.field.stamp(x - dz * side, z + dx * side, Math.atan2(dz, dx));
    this.fading = true;
  }
}

const trackers = new WeakMap<GaesupRuntime, TrailTracker>();

function trackerOf(runtime: GaesupRuntime): TrailTracker {
  let tracker = trackers.get(runtime);
  if (!tracker) trackers.set(runtime, (tracker = new TrailTracker(runtime)));
  return tracker;
}

/**
 * The footprint field of the nearest runtime's world, shared by every sand and snow surface that reads it; null
 * without a runtime or when `enabled` is false. While read, the player's and residents' steps press prints into it.
 */
export function useTrailField(enabled = true): TrailField | null {
  const runtime = useGaesupRuntime();
  const tracker = enabled && runtime ? trackerOf(runtime) : null;
  useEffect(() => tracker?.retain(), [tracker]);
  useSharedFrame(TRAIL_FRAME, (_, elapsed) => tracker?.update(elapsed), tracker !== null);
  return tracker?.field ?? null;
}

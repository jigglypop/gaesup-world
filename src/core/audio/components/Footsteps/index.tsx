import { useEffect, useRef } from 'react';

import { useFrame } from '@react-three/fiber';

import { useBuildingStore } from '../../../building/stores/buildingStore';
import { TILE_CONSTANTS } from '../../../building/types/constants';
import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';
import { useAudioStore } from '../../stores/audioStore';
import type { SfxDef } from '../../types';

export type SurfaceTag = 'grass' | 'sand' | 'snow' | 'wood' | 'stone' | 'water';

export type FootstepsProps = {
  /** Distance the player must travel between two consecutive step sounds. */
  strideMeters?: number;
  /** Cap on how many steps per second can be triggered, regardless of stride. */
  maxStepsPerSecond?: number;
  /** Per-surface volume multiplier (0..1). Defaults to 1. */
  volume?: number;
  /** Override the surface lookup. Most callers should leave this unset. */
  resolveSurface?: (x: number, z: number) => SurfaceTag;
  /** Disable the system without unmounting. */
  enabled?: boolean;
};

const SURFACE_PROFILES: Record<SurfaceTag, Partial<SfxDef>> = {
  grass: { freq: 320, duration: 0.07, type: 'triangle', volume: 0.18 },
  sand:  { freq: 220, duration: 0.10, type: 'sine',     volume: 0.20 },
  snow:  { freq: 380, duration: 0.10, type: 'triangle', volume: 0.22 },
  wood:  { freq: 540, duration: 0.06, type: 'square',   volume: 0.14 },
  stone: { freq: 760, duration: 0.05, type: 'square',   volume: 0.16 },
  water: { freq: 180, duration: 0.13, type: 'sine',     volume: 0.24 },
};

function defaultResolveSurface(x: number, z: number): SurfaceTag {
  const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;
  const groups = useBuildingStore.getState().tileGroups;

  for (const group of groups.values()) {
    for (const tile of group.tiles) {
      const half = ((tile.size || 1) * cellSize) / 2;
      if (Math.abs(tile.position.x - x) > half) continue;
      if (Math.abs(tile.position.z - z) > half) continue;

      switch (tile.objectType) {
        case 'water':     return 'water';
        case 'sand':      return 'sand';
        case 'snowfield': return 'snow';
        case 'grass':     return 'grass';
        default: break;
      }

      // Tile categories without a special object type fall through to floor
      // material guessing. The shape gives a coarse hint.
      if (tile.shape === 'stairs' || tile.shape === 'ramp') return 'wood';
      return 'stone';
    }
  }
  return 'grass';
}

export function Footsteps({
  strideMeters = 0.65,
  maxStepsPerSecond = 6,
  volume = 1,
  resolveSurface = defaultResolveSurface,
  enabled = true,
}: FootstepsProps = {}) {
  const { position, isGrounded, isMoving, speed } = usePlayerPosition({ updateInterval: 32 });
  const lastPosRef = useRef({ x: position.x, z: position.z });
  const accumRef = useRef(0);
  const lastPlayRef = useRef(0);

  useEffect(() => {
    lastPosRef.current.x = position.x;
    lastPosRef.current.z = position.z;
  }, []);

  useFrame(() => {
    if (!enabled) return;

    const now = performance.now();
    const dxRaw = position.x - lastPosRef.current.x;
    const dzRaw = position.z - lastPosRef.current.z;
    lastPosRef.current.x = position.x;
    lastPosRef.current.z = position.z;

    if (!isGrounded || !isMoving) {
      // Reset stride accumulator while airborne so the player doesn't get a
      // burst of steps the instant they land.
      accumRef.current = 0;
      return;
    }

    const stepDist = Math.hypot(dxRaw, dzRaw);
    if (stepDist <= 0) return;
    accumRef.current += stepDist;

    if (accumRef.current < strideMeters) return;
    if (now - lastPlayRef.current < 1000 / maxStepsPerSecond) return;

    accumRef.current = 0;
    lastPlayRef.current = now;

    const surface = resolveSurface(position.x, position.z);
    const profile = SURFACE_PROFILES[surface];
    const speedScale = Math.min(1.4, 0.7 + speed * 0.06);

    useAudioStore.getState().playSfx({
      id: `footstep-${surface}`,
      type: profile.type ?? 'sine',
      freq: profile.freq ?? 320,
      duration: profile.duration ?? 0.08,
      volume: (profile.volume ?? 0.2) * volume * speedScale,
    });
  });

  return null;
}

import { useMemo } from 'react';

import * as THREE from 'three';

import { createToonMaterial } from '@core/rendering/toon';

import { CoverBatch } from './cover/CoverBatch';
import type { CoverEntry } from './cover/geometry';
import { SAND } from './cover/looks';

export type SandEntry = CoverEntry;

const classic: Partial<Record<'toon' | 'pbr', THREE.Material>> = {};

function classicSand(toon: boolean): THREE.Material {
  if (toon) return (classic.toon ??= createToonMaterial({ vertexColors: true, steps: 4 }));
  return (classic.pbr ??= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0.02 }));
}

/**
 * Every sand tile as one dune surface and its skirt. Node renderers add fine grain, wind ripples, glints, wet sand along
 * the shore and footprints; the classic renderer scatters loose grains instead.
 */
export function SandBatch({ entries, toon }: { entries: SandEntry[]; toon?: boolean }) {
  return <CoverBatch name="sand" kind="sand" look={SAND} entries={entries} toon={toon} classic={classicSand} />;
}

type SandProps = { size?: number; toon?: boolean; color?: string; accentColor?: string };

/** A single sand patch at the origin. */
export default function Sand({ size = 4, toon, color, accentColor }: SandProps) {
  const entries = useMemo<SandEntry[]>(
    () => [{ position: [0, 0, 0], size, ...(color ? { color } : {}), ...(accentColor ? { accentColor } : {}) }],
    [size, color, accentColor],
  );
  return <SandBatch entries={entries} {...(toon !== undefined ? { toon } : {})} />;
}

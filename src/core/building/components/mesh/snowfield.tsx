import { useMemo } from 'react';

import * as THREE from 'three';

import { createToonMaterial } from '@core/rendering/toon';

import { CoverBatch } from './cover/CoverBatch';
import type { CoverEntry } from './cover/geometry';
import { SNOW } from './cover/looks';

export type SnowfieldEntry = CoverEntry;

const classic: Partial<Record<'toon' | 'pbr', THREE.Material>> = {};

function classicSnow(toon: boolean): THREE.Material {
  if (toon) return (classic.toon ??= createToonMaterial({ vertexColors: true, steps: 4, emissive: '#9ec1e8', emissiveIntensity: 0.06 }));
  return (classic.pbr ??= new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.88, metalness: 0, clearcoat: 0.12, clearcoatRoughness: 0.75 }));
}

/**
 * Every snowfield tile as one drift surface and its skirt. Node renderers add sculpted relief, blue shade, glints and
 * footprints; the classic renderer scatters sparkles instead.
 */
export function SnowfieldBatch({ entries, toon }: { entries: SnowfieldEntry[]; toon?: boolean }) {
  return <CoverBatch name="snowfield" kind="snow" look={SNOW} entries={entries} toon={toon} classic={classicSnow} />;
}

type SnowfieldProps = { size?: number; toon?: boolean; color?: string; accentColor?: string };

/** A single snowfield at the origin. */
export default function Snowfield({ size = 4, toon, color, accentColor }: SnowfieldProps) {
  const entries = useMemo<SnowfieldEntry[]>(
    () => [{ position: [0, 0, 0], size, ...(color ? { color } : {}), ...(accentColor ? { accentColor } : {}) }],
    [size, color, accentColor],
  );
  return <SnowfieldBatch entries={entries} {...(toon !== undefined ? { toon } : {})} />;
}

import { useEffect, useMemo } from 'react';

import type * as THREE from 'three';

import { buildCoverGeometry, buildCoverSpecks, type CoverEntry, type CoverLook } from './geometry';
import { useCoverMaterial } from './material';
import { getDefaultToonMode } from '../../../../rendering/toon';
import type { CoverKind } from '../../../../rendering/tsl/groundCover';

const disableRaycast = () => undefined;
const SKIRT_USER_DATA = { nonInteractive: true };

export type CoverBatchProps = {
  name: string;
  kind: CoverKind;
  look: CoverLook;
  entries: readonly CoverEntry[];
  toon?: boolean | undefined;
  /** The vertex-colored material the classic WebGL renderer draws with. */
  classic: (toon: boolean) => THREE.Material;
};

/**
 * Every tile of one cover as a surface and a skirt: two draws. Node renderers shade it with the cover's node material;
 * the classic renderer uses `classic` and scatters loose specks over it.
 */
export function CoverBatch({ name, kind, look, entries, toon, classic }: CoverBatchProps) {
  const useToon = toon ?? getDefaultToonMode();
  const node = useCoverMaterial(kind, useToon);
  const shaded = node !== null;
  const geometry = useMemo(() => buildCoverGeometry(entries, look), [entries, look]);
  const specks = useMemo(() => (shaded || !entries.length ? null : buildCoverSpecks(entries, look)), [shaded, entries, look]);
  useEffect(() => () => {
    geometry.surface.dispose();
    geometry.skirt?.dispose();
  }, [geometry]);
  useEffect(() => () => specks?.geometry.dispose(), [specks]);
  if (entries.length === 0) return null;
  const material = node ?? classic(useToon);
  return (
    <>
      <mesh name={`${name}-surface`} geometry={geometry.surface} material={material} receiveShadow />
      {geometry.skirt && (
        <mesh name={`${name}-skirt`} geometry={geometry.skirt} material={material} receiveShadow raycast={disableRaycast} userData={SKIRT_USER_DATA} />
      )}
      {specks && (
        <points name={`${name}-specks`} geometry={specks.geometry}>
          <pointsMaterial size={specks.size} vertexColors transparent opacity={look.specks.opacity} depthWrite={false} />
        </points>
      )}
    </>
  );
}

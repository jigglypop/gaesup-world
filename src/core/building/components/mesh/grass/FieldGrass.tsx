import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { layoutGeometries } from './blade';
import { drawCount, GRASS_LOD, GRASS_MAX_BLADES, GRASS_TIERS, grassBudget, lodWeight, TALL_TIER_REACH, tierIndex } from './budget';
import { createGrassLayoutBuild, PROFILE_HEIGHT, type GrassCell, type GrassLayout } from './field';
import type { GrassTileRenderState } from './manager';
import { useGrassManager } from './useGrassManager';
import { useQualityProfile } from '../../../../perf/quality';
import { usePerfStore } from '../../../../perf/stores/perfStore';
import { CompileGate } from '../../../../rendering/CompileGate';
import { GRASS_FADE_BAND, FieldGrassMaterial } from '../../../../rendering/tsl/grassMaterial';
import type { GrassProfile } from '../../../types';

export type FieldGrassProps = {
  profile: GrassProfile;
  cells: readonly GrassCell[];
  cellSize: number;
  /** World x, z of the local origin, which placement reads its noise at. */
  origin: readonly [number, number];
  /** Candidate blades per m² at quality `instanceScale` 1. */
  density: number;
  /** Average blade height in meters; defaults to the profile's. */
  height?: number | undefined;
  /** Ground under the roots: a flat tile of `color`, or the painted meadow of `color` and `accent`, lifted when `lift`. */
  color: string;
  accent?: string | undefined;
  lift?: boolean;
  /** Blades this layer holds at quality `instanceScale` 1. */
  maxBlades?: number;
  lod?: { near?: number; far?: number; strength?: number } | undefined;
  tipColor?: string | undefined;
  toon?: boolean;
  /** Most joints a blade has. */
  joints?: number;
};

/** Blades never stop the camera or other ray probes. */
const GRASS_USER_DATA = { intangible: true };
/** Tallest blade, as a multiple of the profile's average height, for bounds. */
const TOP = 2.4;

type Shared = { material: FieldGrassMaterial; users: number };
const shared = new WeakMap<object, Map<string, Shared>>();

/** One material per world, look and curve: every layer of the world draws with it and writes the same uniforms. */
function useSharedMaterial(owner: object, key: string, create: () => FieldGrassMaterial): FieldGrassMaterial {
  const material = useMemo(() => {
    let byKey = shared.get(owner);
    if (!byKey) shared.set(owner, (byKey = new Map()));
    let entry = byKey.get(key);
    if (!entry) byKey.set(key, (entry = { material: create(), users: 0 }));
    return entry.material;
  }, [owner, key]);
  useEffect(() => {
    const byKey = shared.get(owner)!;
    let entry = byKey.get(key);
    if (entry?.material !== material) byKey.set(key, (entry = { material, users: 0 }));
    const held = entry;
    held.users += 1;
    return () => {
      if (--held.users > 0) return;
      if (byKey.get(key) === held) byKey.delete(key);
      material.dispose();
    };
  }, [owner, key, material]);
  return material;
}

/** The world's quality profile, else the page-wide one. */
function useInstanceScale(): number {
  const world = useQualityProfile();
  const page = usePerfStore((state) => state.profile.instanceScale);
  return world?.instanceScale ?? page;
}

/** Local box around every root and blade of `cells`. */
function cellBounds(cells: readonly GrassCell[], size: number, top: number): THREE.Box3 {
  const box = new THREE.Box3(), corner = new THREE.Vector3(), margin = size / 2 + top / 2;
  for (const [x, z, y = 0] of cells) {
    box.expandByPoint(corner.set(x - margin, y - 0.2, z - margin));
    box.expandByPoint(corner.set(x + margin, y + top, z + margin));
  }
  return box;
}

/**
 * One layer of wind grass on the node renderer: its blade layout builds within the grass manager's frame budget, and
 * each frame draws a budgeted, distance-weighted prefix of it with fewer joints farther away. Blades receive shadows
 * but cast none.
 */
export default function FieldGrass({
  profile, cells, cellSize, origin: [originX, originZ], density, height, color, accent, lift = false,
  maxBlades = Infinity, lod, tipColor, toon = false, joints = 5,
}: FieldGrassProps) {
  const manager = useGrassManager();
  const get = useThree((state) => state.get);
  const instanceScale = useInstanceScale();
  const anchor = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const drawn = useRef<{ layout: GrassLayout; geometries: THREE.InstancedBufferGeometry[] } | null>(null);
  const [layout, setLayout] = useState<GrassLayout | null>(null);

  const scale = (height ?? PROFILE_HEIGHT[profile]) / PROFILE_HEIGHT[profile];
  const cap = GRASS_MAX_BLADES[profile] * instanceScale;
  const bounds = useMemo(() => cellBounds(cells, cellSize, PROFILE_HEIGHT[profile] * scale * TOP), [cells, cellSize, profile, scale]);
  const { near = GRASS_LOD[profile].near, far = GRASS_LOD[profile].far, strength = GRASS_LOD[profile].strength } = lod ?? {};
  const segments = useMemo(() => GRASS_TIERS.map((tier) => Math.max(1, Math.min(tier.segments, joints))), [joints]);

  const material = useSharedMaterial(manager, `${profile}|${toon}|${tipColor ?? ''}|${near}|${far}|${strength}`, () => {
    const created = new FieldGrassMaterial({ look: profile, toon, ...(tipColor ? { tipColor: new THREE.Color(tipColor) } : {}) });
    created.uniforms.near.value = near;
    created.uniforms.far.value = far;
    created.uniforms.strength.value = Math.max(1, strength);
    return created;
  });

  // The layout builds nearest-first within the manager's per-frame budget; the old one draws until it is ready.
  useEffect(() => {
    const build = createGrassLayoutBuild({
      profile, cells, cellSize, originX, originZ, density: density * instanceScale, heightScale: scale,
      surface: { color: new THREE.Color(color), ...(accent ? { accent: new THREE.Color(accent) } : {}), lift },
      maxBlades: Math.min(maxBlades * instanceScale, cap),
    });
    const center = bounds.getCenter(new THREE.Vector3()).add(new THREE.Vector3(originX, 0, originZ));
    return manager.schedule({
      center,
      step: (deadline) => {
        const done = build.step(deadline);
        if (done) setLayout(build.layout);
        return done;
      },
    });
  }, [manager, profile, cells, cellSize, originX, originZ, density, instanceScale, scale, color, accent, lift, maxBlades, cap, bounds]);

  const geometries = useMemo(() => layout && layoutGeometries(layout, profile, segments, bounds), [layout, profile, segments, bounds]);
  useLayoutEffect(() => {
    drawn.current = layout && geometries ? { layout, geometries } : null;
  }, [layout, geometries]);
  useEffect(() => () => geometries?.forEach((geometry) => geometry.dispose()), [geometries]);

  useLayoutEffect(() => {
    const group = anchor.current;
    if (!group || bounds.isEmpty()) return undefined;
    group.updateWorldMatrix(true, false);
    const box = bounds.clone().applyMatrix4(group.matrixWorld);
    const size = box.getSize(new THREE.Vector3()), eye = new THREE.Vector3();
    // The manager culls by frustum and far range from the center; the count below measures from the nearest point.
    const cull = far + Math.hypot(size.x, size.z) / 2;
    const budget = grassBudget(manager, profile);
    budget.max = cap;
    const slot = {}, reach = profile === 'tall' ? TALL_TIER_REACH : 0, curve = { near, far, strength };
    const apply = (state: GrassTileRenderState) => {
      const target = mesh.current, current = drawn.current;
      if (!target || !current) return;
      const distance = box.distanceToPoint(eye.setFromMatrixPosition(get().camera.matrixWorld));
      const share = state.visible ? lodWeight(distance, curve) : 0;
      budget.request(slot, Math.ceil(current.layout.count * share));
      const keep = budget.scaleAt(state.time);
      const count = drawCount(current.layout.count, share, keep, GRASS_FADE_BAND);
      target.visible = count > 0;
      if (!count) return;
      // Farther layers draw the same blades with fewer joints; a few pixels tall, their bend needs no more.
      const geometry = current.geometries[tierIndex(distance - reach)]!;
      if (target.geometry !== geometry) target.geometry = geometry;
      geometry.instanceCount = count;
      const { uniforms } = material;
      uniforms.time.value = state.time;
      uniforms.wind.value = state.windScale;
      uniforms.keep.value = keep;
      // Without a player the manager parks its trample center far below the world.
      uniforms.trample.value.set(state.trampleCenter.x, state.trampleCenter.z, state.trampleCenter.y > -1000 ? state.trampleStrength : 0);
    };
    const tile = manager.register({
      width: Math.max(size.x, size.z), height: size.y, center: box.getCenter(new THREE.Vector3()),
      maxInstances: 1, lod: { near: cull, far: cull + 1, strength: 1 }, apply,
    });
    return () => {
      manager.unregister(tile.id);
      budget.release(slot);
    };
  }, [manager, bounds, profile, cap, near, far, strength, material, get]);

  return (
    <group ref={anchor}>
      {geometries && (
        <CompileGate>
          <mesh ref={mesh} geometry={geometries[0]!} material={material} receiveShadow userData={GRASS_USER_DATA} />
        </CompileGate>
      )}
    </group>
  );
}

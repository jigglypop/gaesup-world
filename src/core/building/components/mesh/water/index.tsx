import { lazy, Suspense, useEffect, useMemo, useRef } from "react";

import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Water } from "three-stdlib";

import { extendOnce } from '@/core/rendering/extendOnce';
import { getDefaultToonMode } from "@core/rendering/toon";

import { createGlslWaterBedMaterial, createGlslWaterMaterial } from './glsl';
import { getSharedWaterNormals } from './normals';
import { distanceToWater, selectWaterDetail, type WaterLodState } from './shading';
import { rendererKind } from '../../../../rendering/webgpu';
import { useSharedFrame, type SharedFrameChannel } from '../../../../runtime/frame';
import { useShoreField, type ShoreField } from '../../../terrain';

class OwnedWater extends Water {
  override dispose(): void {
    const mirror: unknown = this.material.uniforms['mirrorSampler']?.value;
    if (mirror instanceof THREE.Texture) mirror.renderTarget?.dispose();
    this.material.dispose();
    // Object3D.dispose (three r186+) notifies renderers; older supported releases lack it.
    super.dispose?.();
  }
}

const extendWater = extendOnce({ Water: OwnedWater });
const WATER_FRAME: SharedFrameChannel = { phase: 'effects', label: 'building:water' };
const NodeWaterMaterial = lazy(() => import('./NodeWaterMaterial'));
const NodeWaterBed = lazy(() => import('./NodeWaterMaterial').then((module) => ({ default: module.NodeWaterBed })));
const SURFACE_Y = 0.1;
/** Meters over which fallback coverage climbs from a shore side (0.5) to open water (1), like a blurred field. */
const SHORE_RAMP = 2.5;
/** Fallback distance to land where no shore side is near. */
const OPEN_DISTANCE = 1000;
/** The open sea's floor is three times finer than its surface, so its shelf follows the shore closely. */
const SEA_BED_DETAIL = 3;
/** Water draws first among see-through things: it shows the opaque scene behind it, and they draw over it. */
const WATER_RENDER_ORDER = -1;

type ShoreSides = { north: boolean; south: boolean; east: boolean; west: boolean };

type WaterProps = {
  /** `far` hides the surface past that distance. `near` and `strength` are unused: detail follows `WATER_DETAIL_LOD` (40/52 m). */
  lod?: {
    near?: number;
    far?: number;
    strength?: number;
  };
  center?: [number, number, number];
  size?: number;
  width?: number;
  depth?: number;
  /** @deprecated Shores come from the world's shore field; only water without one shades these sides as shore. */
  shore?: Partial<ShoreSides>;
  /** An open sea under the camera, over a sea floor that shelves away from the shore; no banks of its own. */
  followCamera?: boolean;
  /** Borrowed repeating normal texture. The caller owns its lifetime. */
  normalMap?: THREE.Texture;
  /** Unlit stylized shading. Defaults to the global toon mode. */
  toon?: boolean;
  /** Multiplier for the surface color (1 = authored colors), e.g. to dim water at night. */
  brightness?: number;
  /** Shore coverage to shade with. Defaults to the world's building field (`useShoreField`); `null` opts out. */
  field?: ShoreField | null;
};

/**
 * A level grid whose `waterCoverage` climbs from the shore sides into the open and whose `waterDistance` is meters to
 * the nearest of them; without shores it is open water.
 */
function createSurfaceGeometry(width: number, depth: number, segments: number, shore: ShoreSides | null): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
  const position = geometry.getAttribute('position');
  const coverage = new Float32Array(position.count);
  const distances = new Float32Array(position.count);
  for (let i = 0; i < position.count; i++) {
    // The plane's +y becomes north (-z) once it lies flat.
    const x = position.getX(i);
    const y = position.getY(i);
    let distance = Number.POSITIVE_INFINITY;
    if (shore?.west) distance = Math.min(distance, x + width / 2);
    if (shore?.east) distance = Math.min(distance, width / 2 - x);
    if (shore?.north) distance = Math.min(distance, depth / 2 - y);
    if (shore?.south) distance = Math.min(distance, y + depth / 2);
    coverage[i] = Math.min(1, 0.5 + distance / (2 * SHORE_RAMP));
    distances[i] = Math.min(distance, OPEN_DISTANCE);
  }
  geometry.setAttribute('waterCoverage', new THREE.BufferAttribute(coverage, 1));
  geometry.setAttribute('waterDistance', new THREE.BufferAttribute(distances, 1));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

export default function Ocean({ lod, center, size = 16, width, depth, shore, toon, normalMap, followCamera = false, brightness = 1, field: fieldProp }: WaterProps) {
  extendWater();
  const useToon = toon ?? getDefaultToonMode();
  const useNodes = useThree((state) => rendererKind(state.gl) !== 'webgl');
  const worldField = useShoreField();
  const field = fieldProp === undefined ? worldField : fieldProp;
  // three-stdlib's mirror Water renders through WebGL-only APIs and cannot follow a shore; plain classic water keeps it.
  const useMirrorWater = !useToon && !useNodes && !field;
  // Water bound to a field waits for its first build; the open sea starts as open water.
  const ready = followCamera || !field || field.version > 0;
  const groupRef = useRef<THREE.Group | null>(null);
  const waterRef = useRef<Water | null>(null);
  const fallbackRef = useRef<THREE.Mesh | null>(null);
  const lodState = useRef<WaterLodState>({ detailed: true }).current;
  const visibleRef = useRef(true);
  const checkRef = useRef(Number.POSITIVE_INFINITY);
  const mirrorTimeRef = useRef(0);
  const surfaceWidth = width ?? size;
  const surfaceDepth = depth ?? size;
  const segments = Math.max(8, Math.min(64, Math.round(Math.max(surfaceWidth, surfaceDepth) * 2)));
  const centerX = center?.[0] ?? 0;
  const centerZ = center?.[2] ?? 0;

  // Shared procedural normal texture avoids per-tile image decode and upload.
  const waterNormals = normalMap ?? getSharedWaterNormals();

  const sides = useMemo<ShoreSides | null>(
    () => (followCamera ? null : {
      north: shore?.north ?? true,
      south: shore?.south ?? true,
      east: shore?.east ?? true,
      west: shore?.west ?? true,
    }),
    [followCamera, shore?.east, shore?.north, shore?.south, shore?.west],
  );
  const geometry = useMemo(
    () => createSurfaceGeometry(surfaceWidth, surfaceDepth, segments, sides),
    [segments, sides, surfaceDepth, surfaceWidth],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  // The sea floor steps with the surface grid (whole surface cells), so its vertices stay on fixed world points too.
  const bedGeometry = useMemo(
    () => (followCamera ? createSurfaceGeometry(surfaceWidth, surfaceDepth, segments * SEA_BED_DETAIL, null) : geometry),
    [followCamera, geometry, segments, surfaceDepth, surfaceWidth],
  );
  useEffect(() => () => { if (bedGeometry !== geometry) bedGeometry.dispose(); }, [bedGeometry, geometry]);

  const glslMaterial = useMemo(
    () => (useNodes || useMirrorWater ? null : createGlslWaterMaterial({ normals: waterNormals, field, open: followCamera })),
    [field, followCamera, useMirrorWater, useNodes, waterNormals],
  );
  useEffect(() => () => glslMaterial?.dispose(), [glslMaterial]);
  const glslBedMaterial = useMemo(
    () => (useNodes || useMirrorWater ? null : createGlslWaterBedMaterial({ normals: waterNormals, field, open: followCamera })),
    [field, followCamera, useMirrorWater, useNodes, waterNormals],
  );
  useEffect(() => () => glslBedMaterial?.dispose(), [glslBedMaterial]);
  useEffect(() => {
    for (const material of [glslMaterial, glslBedMaterial]) {
      const uniform = material?.uniforms['uBrightness'];
      if (uniform) uniform.value = brightness;
    }
  }, [glslMaterial, glslBedMaterial, brightness]);

  const renderTargetSize = useMemo(() => {
    const longest = Math.max(surfaceWidth, surfaceDepth);
    if (longest <= 8) return 192;
    if (longest <= 24) return 256;
    return 384;
  }, [surfaceDepth, surfaceWidth]);
  const config = useMemo(
    () => ({
      textureWidth: renderTargetSize,
      textureHeight: renderTargetSize,
      waterNormals,
      sunDirection: new THREE.Vector3(0.1, 0.7, 0.2),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
    }),
    [renderTargetSize, waterNormals],
  );
  const fallbackMaterial = useMemo(
    () => (useMirrorWater ? new THREE.MeshPhysicalMaterial({
      color: '#2f8dbd',
      roughness: 0.18,
      metalness: 0,
      transparent: true,
      opacity: 0.72,
      clearcoat: 0.45,
      clearcoatRoughness: 0.24,
      normalMap: waterNormals,
      normalScale: new THREE.Vector2(0.08, 0.08),
      depthWrite: false,
    }) : null),
    [useMirrorWater, waterNormals],
  );
  useEffect(() => () => fallbackMaterial?.dispose(), [fallbackMaterial]);

  useSharedFrame(WATER_FRAME, (delta, elapsedSeconds, three) => {
    const group = groupRef.current;
    if (!group) return;
    const camera = three.camera.position;
    if (followCamera) {
      // Whole grid steps keep vertices on fixed world points, so the swell never slides across them.
      const step = surfaceWidth / segments;
      group.position.set(Math.round((camera.x - centerX) / step) * step, 0, Math.round((camera.z - centerZ) / step) * step);
    }
    checkRef.current += Math.max(0, delta);
    if (checkRef.current >= (visibleRef.current ? 0.2 : 0.5)) {
      checkRef.current = 0;
      group.updateWorldMatrix(true, false);
      const origin = group.matrixWorld.elements;
      const distance = distanceToWater(
        camera.x, camera.y, camera.z,
        origin[12]!, origin[13]! + SURFACE_Y, origin[14]!,
        surfaceWidth / 2, surfaceDepth / 2,
      );
      visibleRef.current = !lod || distance < (lod.far ?? 180);
      lodState.detailed = selectWaterDetail(lodState.detailed, distance);
    }
    group.visible = ready && visibleRef.current;
    if (!group.visible) return;

    for (const material of [glslMaterial, glslBedMaterial]) {
      if (!material) continue;
      material.uniforms['uTime']!.value = elapsedSeconds;
      material.uniforms['uDetail']!.value = lodState.detailed ? 1 : 0;
    }
    if (!useMirrorWater) return;
    const mirror = waterRef.current;
    if (mirror) mirror.visible = lodState.detailed;
    if (fallbackRef.current) fallbackRef.current.visible = !lodState.detailed;
    if (!mirror || !lodState.detailed) return;
    mirrorTimeRef.current += Math.max(0, delta);
    if (mirrorTimeRef.current < 1 / 30) return;
    const time = mirror.material.uniforms['time'];
    if (time) time.value += mirrorTimeRef.current * 0.3;
    mirrorTimeRef.current = 0;
  });

  return (
    <group ref={groupRef} visible={ready}>
      {useNodes ? (
        <Suspense fallback={null}>
          <mesh geometry={geometry} rotation-x={-Math.PI / 2} position={[0, SURFACE_Y, 0]} renderOrder={WATER_RENDER_ORDER}>
            <NodeWaterMaterial
              normalMap={waterNormals}
              brightness={brightness}
              toon={useToon}
              field={field}
              open={followCamera}
              lod={lodState}
            />
          </mesh>
          <mesh geometry={bedGeometry} rotation-x={-Math.PI / 2} position={[0, SURFACE_Y, 0]} receiveShadow={!followCamera}>
            <NodeWaterBed field={field} open={followCamera} normalMap={waterNormals} />
          </mesh>
        </Suspense>
      ) : useMirrorWater ? (
        <>
          <water ref={waterRef} args={[geometry, config]} rotation-x={-Math.PI / 2} position={[0, SURFACE_Y, 0]} />
          {fallbackMaterial && (
            <mesh
              ref={fallbackRef}
              geometry={geometry}
              material={fallbackMaterial}
              rotation-x={-Math.PI / 2}
              position={[0, SURFACE_Y - 0.005, 0]}
              visible={false}
            />
          )}
        </>
      ) : (
        glslMaterial && glslBedMaterial && (
          <>
            <mesh geometry={geometry} material={glslMaterial} rotation-x={-Math.PI / 2} position={[0, SURFACE_Y, 0]} renderOrder={WATER_RENDER_ORDER} />
            <mesh geometry={bedGeometry} material={glslBedMaterial} rotation-x={-Math.PI / 2} position={[0, SURFACE_Y, 0]} />
          </>
        )
      )}
    </group>
  );
}

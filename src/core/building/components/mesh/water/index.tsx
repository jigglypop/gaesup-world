import { lazy, Suspense, useEffect, useMemo, useRef } from "react";

import { extend, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Water } from "three-stdlib";

import { getDefaultToonMode } from "@core/rendering/toon";
import { weightFromDistance } from "@core/utils/sfe";

import { useSharedFrame, type SharedFrameChannel } from '../../../../runtime/frame';
import { getSharedWaterNormals } from './normals';


class OwnedWater extends Water {
  override dispose(): void {
    const mirror: unknown = this.material.uniforms['mirrorSampler']?.value;
    if (mirror instanceof THREE.Texture) mirror.renderTarget?.dispose();
    this.material.dispose();
    // Object3D.dispose (three r186+) notifies renderers; older supported releases lack it.
    super.dispose?.();
  }
}

extend({ Water: OwnedWater });
const WATER_FRAME: SharedFrameChannel = { phase: 'effects', label: 'building:water' };
const NodeWaterMaterial = lazy(() => import('./NodeWaterMaterial'));

type WaterProps = {
  lod?: {
    near?: number;
    far?: number;
    strength?: number;
  };
  center?: [number, number, number];
  size?: number;
  width?: number;
  depth?: number;
  shore?: Partial<{
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  }>;
  followCamera?: boolean;
  /** Borrowed repeating normal texture. The caller owns its lifetime. */
  normalMap?: THREE.Texture;
  /**
   * When true, uses a lightweight stylized shader without reflection RT.
   * Defaults to the global toon mode. The normal path keeps the original Water quality.
   */
  toon?: boolean;
  /** Multiplier for the unlit toon surface (1 = authored colors), e.g. to dim water at night. */
  brightness?: number;
};

// Vertex displacement uses world-space frequencies (cycles per meter) so wave
// length stays constant regardless of tile scale. Three octaves give the surface
// enough motion to read on tiles of every size.
const TOON_WATER_VERT = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying vec3 vWorldPos;
varying float vWave;

void main() {
  vUv = uv;
  vec3 p = position;
  float w1 = sin(p.x * 0.55 + uTime * 0.85) * 0.085;
  float w2 = sin(p.y * 0.78 - uTime * 1.05 + p.x * 0.33) * 0.055;
  float w3 = sin((p.x + p.y) * 1.40 + uTime * 1.60) * 0.025;
  float w  = w1 + w2 + w3;
  p.z += w;
  vWave = w;
  vWorldPos = (modelMatrix * vec4(p, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

// Two scrolling normal samples replace per-pixel multi-octave noise. Both
// render backends share the same texture, wave silhouette and shading model.
const TOON_WATER_FRAG = /* glsl */ `
uniform vec3 uShallow;
uniform vec3 uDeep;
uniform vec3 uFoam;
uniform sampler2D uNormals;
uniform float uTime;
uniform float uBrightness;
varying vec2 vUv;
varying vec3 vWorldPos;
varying float vWave;
void main() {
  vec2 p = vWorldPos.xz;
  vec2 a = texture2D(uNormals, p * 0.055 + vec2(uTime * 0.009, uTime * 0.004)).xy * 2.0 - 1.0;
  vec2 b = texture2D(uNormals, p * 0.12 + vec2(-uTime * 0.006, uTime * 0.008)).xy * 2.0 - 1.0;
  vec3 n = normalize(vec3((a.x + b.x) * 0.48, 1.0, (a.y + b.y) * 0.48));
  vec3 view = normalize(cameraPosition - vWorldPos);
  float fresnel = pow(1.0 - max(dot(n, view), 0.0), 3.0);
  float highlight = pow(max(dot(n, normalize(view + normalize(vec3(-0.5, 0.9, -0.3)))), 0.0), 96.0);
  float tint = clamp(0.42 + vWave * 1.1 + n.x * 0.28, 0.0, 1.0);
  vec3 col = mix(uDeep, uShallow, tint);
  col = mix(col, vec3(0.48, 0.72, 0.78), fresnel * 0.6);
  col += uFoam * highlight * 0.38;
  gl_FragColor = vec4(col * uBrightness, 1.0);
  #include <colorspace_fragment>
}
`;

export default function Ocean({ lod, center, size = 16, width, depth, shore, toon, normalMap, followCamera = false, brightness = 1 }: WaterProps) {
  const useToon = toon ?? getDefaultToonMode();
  const useNodes = useThree((state) => 'isWebGPURenderer' in state.gl && state.gl.isWebGPURenderer === true);
  const waterRef = useRef<Water | null>(null);
  const toonMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const toonMeshRef = useRef<THREE.Mesh | null>(null);
  const fallbackMeshRef = useRef<THREE.Mesh | null>(null);
  const centerRef = useRef(
    new THREE.Vector3(center?.[0] ?? 0, center?.[1] ?? 0, center?.[2] ?? 0),
  );
  const lastVisibleRef = useRef<boolean>(true);
  const highQualityRef = useRef<boolean>(!lod);
  const lodCheckAccumRef = useRef<number>(lod ? Number.POSITIVE_INFINITY : 0);
  const timeAccumRef = useRef<number>(0);
  const shallowMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#8dbab5',
        roughness: 0.28,
        metalness: 0.02,
        transparent: true,
        opacity: 0.42,
        clearcoat: 0.18,
        clearcoatRoughness: 0.72,
        depthWrite: false,
      }),
    [],
  );
  const shoreMask = useMemo(
    () => ({
      north: shore?.north ?? true,
      south: shore?.south ?? true,
      east: shore?.east ?? true,
      west: shore?.west ?? true,
    }),
    [shore?.east, shore?.north, shore?.south, shore?.west],
  );
  const surfaceWidth = width ?? size;
  const surfaceDepth = depth ?? size;
  const shoreWidth = Math.min(Math.min(surfaceWidth, surfaceDepth) * 0.18, 0.72);
  const insetNorth = shoreMask.north ? shoreWidth : 0;
  const insetSouth = shoreMask.south ? shoreWidth : 0;
  const insetEast = shoreMask.east ? shoreWidth : 0;
  const insetWest = shoreMask.west ? shoreWidth : 0;
  const waterWidth = Math.max(surfaceWidth - insetWest - insetEast, surfaceWidth * 0.34);
  const waterDepth = Math.max(surfaceDepth - insetNorth - insetSouth, surfaceDepth * 0.34);
  const waterOffsetX = (insetWest - insetEast) * 0.5;
  const waterOffsetZ = (insetNorth - insetSouth) * 0.5;
  const shoreSpanX = Math.max(
    surfaceWidth - (shoreMask.west ? shoreWidth * 0.25 : 0) - (shoreMask.east ? shoreWidth * 0.25 : 0),
    surfaceWidth * 0.42,
  );
  const shoreSpanZ = Math.max(
    surfaceDepth - (shoreMask.north ? shoreWidth * 0.25 : 0) - (shoreMask.south ? shoreWidth * 0.25 : 0),
    surfaceDepth * 0.42,
  );
  
  // Shared procedural normal texture avoids per-tile image decode and upload.
  const waterNormals = normalMap ?? getSharedWaterNormals();

  const renderTargetSize = useMemo(() => {
    const longest = Math.max(surfaceWidth, surfaceDepth);
    if (longest <= 8) return 192;
    if (longest <= 24) return 256;
    return 384;
  }, [surfaceDepth, surfaceWidth]);

  useEffect(() => {
    centerRef.current.set(center?.[0] ?? 0, center?.[1] ?? 0, center?.[2] ?? 0);
  }, [center]);

  useEffect(() => {
    highQualityRef.current = !lod;
    lodCheckAccumRef.current = lod ? Number.POSITIVE_INFINITY : 0;
  }, [lod]);
  
  const config = useMemo(
    () => ({
      textureWidth: renderTargetSize,
      textureHeight: renderTargetSize,
      ...(waterNormals ? { waterNormals } : {}),
      sunDirection: new THREE.Vector3(0.1, 0.7, 0.2),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
    }),
    [renderTargetSize, waterNormals]
  );
  
  // Tessellation density also scales with tile size so wave amplitude stays smooth on
  // large tiles. Capped to keep big tiles from blowing up the vertex count.
  const segs = useMemo(() => {
    const longest = Math.max(waterWidth, waterDepth);
    const base = useToon ? Math.round(longest * 2.5) : Math.round(longest * 1.2);
    return Math.max(useToon ? 14 : 6, Math.min(useToon ? 56 : 32, base));
  }, [useToon, waterWidth, waterDepth]);
  const geom = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(waterWidth, waterDepth, segs, segs);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
  }, [waterDepth, waterWidth, segs]);
  const fallbackMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#2f8dbd',
        roughness: 0.18,
        metalness: 0,
        transparent: true,
        opacity: 0.72,
        clearcoat: 0.45,
        clearcoatRoughness: 0.24,
        normalMap: waterNormals,
        normalScale: new THREE.Vector2(0.22, 0.22),
        depthWrite: false,
      }),
    [waterNormals],
  );
  const toonMaterial = useMemo(() => {
    if (!useToon || useNodes) return null;
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uNormals: { value: waterNormals },
        uShallow: { value: new THREE.Color('#48b9b4') },
        uDeep: { value: new THREE.Color('#176180') },
        uFoam: { value: new THREE.Color('#ffffff') },
        uBrightness: { value: 1 },
      },
      vertexShader: TOON_WATER_VERT,
      fragmentShader: TOON_WATER_FRAG,
      toneMapped: false,
    });
  }, [useToon, useNodes, waterNormals]);
  useEffect(() => {
    const uniform = toonMaterial?.uniforms['uBrightness'];
    if (uniform) uniform.value = brightness;
  }, [toonMaterial, brightness]);

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => fallbackMaterial.dispose(), [fallbackMaterial]);
  useEffect(() => () => toonMaterial?.dispose(), [toonMaterial]);

  useEffect(() => {
    return () => {
      shallowMaterial.dispose();
    };
  }, [shallowMaterial]);

  useSharedFrame(WATER_FRAME, (delta, elapsedSeconds, three) => {
    const target = useToon ? (toonMeshRef.current as THREE.Object3D | null) : (waterRef.current as THREE.Object3D | null);
    if (!target) return;

    const water = waterRef.current as THREE.Object3D | null;
    const fallback = fallbackMeshRef.current;
    if (followCamera) {
      const x = three.camera.position.x - centerRef.current.x + waterOffsetX;
      const z = three.camera.position.z - centerRef.current.z + waterOffsetZ;
      target.position.set(x, 0.1, z);
      if (water && water !== target) water.position.set(x, 0.1, z);
      if (fallback) fallback.position.set(x, 0.095, z);
    }

    if (lod) {
      lodCheckAccumRef.current += Math.max(0, delta);
      const checkInterval = lastVisibleRef.current ? 0.2 : 0.5;
      if (lodCheckAccumRef.current >= checkInterval) {
        lodCheckAccumRef.current = 0;

        const near = lod.near ?? 30;
        const far = lod.far ?? 180;
        const strength = lod.strength ?? 4;
        const dist = three.camera.position.distanceTo(centerRef.current);
        const w = weightFromDistance(dist, near, far, strength);
        const visible = w > 0;
        highQualityRef.current = !useToon && dist <= near;
        if (visible !== lastVisibleRef.current) {
          lastVisibleRef.current = visible;
          target.visible = visible;
        }
      }

      if (!lastVisibleRef.current) {
        if (water) water.visible = false;
        if (fallback) fallback.visible = false;
        return;
      }
    }

    if (useToon) {
      if (fallback) fallback.visible = false;
      const u = toonMatRef.current?.uniforms?.['uTime'];
      if (u) u.value = elapsedSeconds;
    } else {
      const useHighQualityWater = highQualityRef.current;
      if (water) water.visible = useHighQualityWater;
      if (fallback) fallback.visible = !useHighQualityWater;
      if (!useHighQualityWater) return;

      timeAccumRef.current += Math.max(0, delta);
      if (timeAccumRef.current < 1 / 30) return;
      const time = waterRef.current?.material.uniforms?.["time"];
      if (time) time.value += timeAccumRef.current * 0.3;
      timeAccumRef.current = 0;
    }
  });

  return (
    <group>
      {shoreMask.north && (
        <mesh
          rotation-x={-Math.PI / 2}
          position={[0, 0.055, -surfaceDepth / 2 + shoreWidth / 2]}
          material={shallowMaterial}
          receiveShadow
        >
          <planeGeometry args={[shoreSpanX, shoreWidth, 1, 1]} />
        </mesh>
      )}

      {shoreMask.south && (
        <mesh
          rotation-x={-Math.PI / 2}
          position={[0, 0.055, surfaceDepth / 2 - shoreWidth / 2]}
          material={shallowMaterial}
          receiveShadow
        >
          <planeGeometry args={[shoreSpanX, shoreWidth, 1, 1]} />
        </mesh>
      )}

      {shoreMask.west && (
        <mesh
          rotation-x={-Math.PI / 2}
          position={[-surfaceWidth / 2 + shoreWidth / 2, 0.055, 0]}
          material={shallowMaterial}
          receiveShadow
        >
          <planeGeometry args={[shoreWidth, shoreSpanZ, 1, 1]} />
        </mesh>
      )}

      {shoreMask.east && (
        <mesh
          rotation-x={-Math.PI / 2}
          position={[surfaceWidth / 2 - shoreWidth / 2, 0.055, 0]}
          material={shallowMaterial}
          receiveShadow
        >
          <planeGeometry args={[shoreWidth, shoreSpanZ, 1, 1]} />
        </mesh>
      )}

      {useToon ? (
        <Suspense fallback={null}>
          <mesh
            ref={toonMeshRef}
            geometry={geom}
            rotation-x={-Math.PI / 2}
            position={[waterOffsetX, 0.1, waterOffsetZ]}
            frustumCulled
          >
            {useNodes ? <NodeWaterMaterial normalMap={waterNormals} brightness={brightness} /> : (
              <primitive
                ref={toonMatRef}
                object={toonMaterial as THREE.ShaderMaterial}
                attach="material"
              />
            )}
          </mesh>
        </Suspense>
      ) : (
        <>
          <water
            ref={waterRef}
            args={[geom, config]}
            rotation-x={-Math.PI / 2}
            position={[waterOffsetX, 0.1, waterOffsetZ]}
            frustumCulled
          />
          <mesh
            ref={fallbackMeshRef}
            geometry={geom}
            material={fallbackMaterial}
            rotation-x={-Math.PI / 2}
            position={[waterOffsetX, 0.095, waterOffsetZ]}
            visible={false}
            frustumCulled
          />
        </>
      )}
    </group>
  );
}

import { useEffect, useMemo, useRef } from "react";

import { useTexture } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Water } from "three-stdlib";

import { getDefaultToonMode } from "@core/rendering/toon";
import { weightFromDistance } from "@core/utils/sfe";

extend({ Water });

type WaterProps = {
  lod?: {
    near?: number;
    far?: number;
    strength?: number;
  };
  center?: [number, number, number];
  size?: number;
  shore?: Partial<{
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  }>;
  /**
   * When true, uses a lightweight stylized shader without reflection RT.
   * Defaults to the global toon mode. Removes per-frame mirror render pass.
   */
  toon?: boolean;
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

// Fragment uses world-XZ for every detail layer (foam stripes, sparse specks,
// rippling highlights, depth tint) so density and pattern stay visually
// consistent at every tile size. Edge vignette softens the rectangular border.
const TOON_WATER_FRAG = /* glsl */ `
uniform vec3 uShallow;
uniform vec3 uDeep;
uniform vec3 uFoam;
uniform float uTime;
varying vec2 vUv;
varying vec3 vWorldPos;
varying float vWave;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.07 + vec2(13.7, 7.1);
    a *= 0.5;
  }
  return v;
}

float band(float v, float c, float w) {
  return smoothstep(c - w, c, v) - smoothstep(c, c + w, v);
}

void main() {
  vec2 wp = vWorldPos.xz;

  float baseNoise = fbm(wp * 0.18 + vec2(uTime * 0.04, -uTime * 0.03));
  float depthCol  = clamp(0.5 + vWave * 3.5 + (baseNoise - 0.5) * 0.55, 0.0, 1.0);
  vec3  base      = mix(uDeep, uShallow, depthCol);

  float stripeCoord = (wp.x + wp.y) * 0.55 + uTime * 0.35 + baseNoise * 0.8;
  float stripe      = sin(stripeCoord * 6.0) * 0.5 + 0.5;
  float stripeFoam  = band(stripe, 0.86, 0.10) * (0.35 + depthCol * 0.65);

  float specks = smoothstep(0.78, 0.95, fbm(wp * 0.62 + uTime * 0.10));
  float ripple = smoothstep(0.60, 0.95, fbm(wp * 1.30 + uTime * 0.60));

  vec3 col = mix(base, uFoam, stripeFoam * 0.55 + specks * 0.50 + ripple * 0.18);

  float edge = smoothstep(0.0, 0.06, min(min(vUv.x, vUv.y), min(1.0 - vUv.x, 1.0 - vUv.y)));
  col = mix(col * 0.86, col, edge);

  gl_FragColor = vec4(col, 0.88);
}
`;

export default function Ocean({ lod, center, size = 16, shore, toon }: WaterProps) {
  const useToon = toon ?? getDefaultToonMode();
  const waterRef = useRef<(Water & { dispose?: () => void }) | null>(null);
  const toonMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const toonMeshRef = useRef<THREE.Mesh | null>(null);
  const waterNormals = useTexture("/resources/waternormals.jpeg");
  const centerRef = useRef(new THREE.Vector3());
  const lastVisibleRef = useRef<boolean>(true);
  const lodCheckAccumRef = useRef<number>(0);
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
  const shoreWidth = Math.min(size * 0.18, 0.72);
  const insetNorth = shoreMask.north ? shoreWidth : 0;
  const insetSouth = shoreMask.south ? shoreWidth : 0;
  const insetEast = shoreMask.east ? shoreWidth : 0;
  const insetWest = shoreMask.west ? shoreWidth : 0;
  const waterWidth = Math.max(size - insetWest - insetEast, size * 0.34);
  const waterDepth = Math.max(size - insetNorth - insetSouth, size * 0.34);
  const waterOffsetX = (insetWest - insetEast) * 0.5;
  const waterOffsetZ = (insetNorth - insetSouth) * 0.5;
  const shoreSpanX = Math.max(
    size - (shoreMask.west ? shoreWidth * 0.25 : 0) - (shoreMask.east ? shoreWidth * 0.25 : 0),
    size * 0.42,
  );
  const shoreSpanZ = Math.max(
    size - (shoreMask.north ? shoreWidth * 0.25 : 0) - (shoreMask.south ? shoreWidth * 0.25 : 0),
    size * 0.42,
  );
  
  // Repeat the normal-map at a fixed world-scale (~ 1 tile per 4 units) so wave detail
  // keeps the same density when the tile is scaled up. With a fixed repeat=(4,4) the
  // pattern visibly stretched on large tiles.
  const normalRepeat = useMemo(() => Math.max(2, Math.round(size / 4)), [size]);
  useEffect(() => {
    if (waterNormals) {
      waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
      waterNormals.repeat.set(normalRepeat, normalRepeat);
      waterNormals.needsUpdate = true;
    }
  }, [waterNormals, normalRepeat]);

  useEffect(() => {
    if (center) {
      centerRef.current.set(center[0], center[1], center[2]);
    }
  }, [center]);
  
  const config = useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(0.1, 0.7, 0.2),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
    }),
    [waterNormals]
  );
  
  // Tessellation density also scales with tile size so wave amplitude stays smooth on
  // large tiles. Capped to keep big tiles from blowing up the vertex count.
  const segs = useMemo(() => {
    const longest = Math.max(waterWidth, waterDepth);
    const base = useToon ? Math.round(longest * 4) : Math.round(longest * 1.2);
    return Math.max(useToon ? 16 : 6, Math.min(useToon ? 96 : 32, base));
  }, [useToon, waterWidth, waterDepth]);
  const geom = useMemo(
    () => new THREE.PlaneGeometry(waterWidth, waterDepth, segs, segs),
    [waterDepth, waterWidth, segs],
  );
  const toonMaterial = useMemo(() => {
    if (!useToon) return null;
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uShallow: { value: new THREE.Color('#9ed6c8') },
        uDeep: { value: new THREE.Color('#1f5f88') },
        uFoam: { value: new THREE.Color('#ffffff') },
      },
      vertexShader: TOON_WATER_VERT,
      fragmentShader: TOON_WATER_FRAG,
      transparent: true,
      depthWrite: false,
    });
  }, [useToon]);

  useEffect(() => {
    return () => {
      geom.dispose();
      const water = waterRef.current;
      // Water (three-stdlib) may own internal GPU resources; clean up defensively.
      water?.material?.dispose?.();
      if (typeof water?.dispose === 'function') {
        water.dispose();
      }
      toonMaterial?.dispose();
    };
  }, [geom, toonMaterial]);

  useEffect(() => {
    return () => {
      shallowMaterial.dispose();
    };
  }, [shallowMaterial]);

  useFrame((state, delta) => {
    const target = useToon ? (toonMeshRef.current as THREE.Object3D | null) : (waterRef.current as THREE.Object3D | null);
    if (!target) return;

    if (lod) {
      lodCheckAccumRef.current += Math.max(0, delta);
      const checkInterval = lastVisibleRef.current ? 0.2 : 0.5;
      if (lodCheckAccumRef.current >= checkInterval) {
        lodCheckAccumRef.current = 0;

        const near = lod.near ?? 30;
        const far = lod.far ?? 180;
        const strength = lod.strength ?? 4;
        const dist = state.camera.position.distanceTo(centerRef.current);
        const w = weightFromDistance(dist, near, far, strength);
        const visible = w > 0;
        if (visible !== lastVisibleRef.current) {
          lastVisibleRef.current = visible;
          target.visible = visible;
        }
      }

      if (!lastVisibleRef.current) return;
    }

    if (useToon) {
      const u = toonMatRef.current?.uniforms?.['uTime'];
      if (u) u.value = state.clock.elapsedTime;
    } else {
      const time = waterRef.current?.material.uniforms?.["time"];
      if (time) time.value += delta * 0.3;
    }
  });

  return (
    <group>
      {shoreMask.north && (
        <mesh
          rotation-x={-Math.PI / 2}
          position={[0, 0.055, -size / 2 + shoreWidth / 2]}
          material={shallowMaterial}
          receiveShadow
        >
          <planeGeometry args={[shoreSpanX, shoreWidth, 1, 1]} />
        </mesh>
      )}

      {shoreMask.south && (
        <mesh
          rotation-x={-Math.PI / 2}
          position={[0, 0.055, size / 2 - shoreWidth / 2]}
          material={shallowMaterial}
          receiveShadow
        >
          <planeGeometry args={[shoreSpanX, shoreWidth, 1, 1]} />
        </mesh>
      )}

      {shoreMask.west && (
        <mesh
          rotation-x={-Math.PI / 2}
          position={[-size / 2 + shoreWidth / 2, 0.055, 0]}
          material={shallowMaterial}
          receiveShadow
        >
          <planeGeometry args={[shoreWidth, shoreSpanZ, 1, 1]} />
        </mesh>
      )}

      {shoreMask.east && (
        <mesh
          rotation-x={-Math.PI / 2}
          position={[size / 2 - shoreWidth / 2, 0.055, 0]}
          material={shallowMaterial}
          receiveShadow
        >
          <planeGeometry args={[shoreWidth, shoreSpanZ, 1, 1]} />
        </mesh>
      )}

      {useToon ? (
        <mesh
          ref={toonMeshRef}
          geometry={geom}
          rotation-x={-Math.PI / 2}
          position={[waterOffsetX, 0.1, waterOffsetZ]}
        >
          <primitive
            ref={toonMatRef}
            object={toonMaterial as THREE.ShaderMaterial}
            attach="material"
          />
        </mesh>
      ) : (
        <water
          ref={waterRef}
          args={[geom, config]}
          rotation-x={-Math.PI / 2}
          position={[waterOffsetX, 0.1, waterOffsetZ]}
        />
      )}
    </group>
  );
}

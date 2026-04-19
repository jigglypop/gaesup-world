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

const TOON_WATER_VERT = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying float vWave;

void main() {
  vUv = uv;
  vec3 p = position;
  float w = sin(p.x * 1.7 + uTime * 0.9) * 0.06
          + sin(p.y * 2.3 - uTime * 1.1) * 0.04;
  p.z += w;
  vWave = w;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const TOON_WATER_FRAG = /* glsl */ `
uniform vec3 uShallow;
uniform vec3 uDeep;
uniform vec3 uFoam;
uniform float uTime;
varying vec2 vUv;
varying float vWave;

float band(float v, float c, float w) {
  return smoothstep(c - w, c, v) - smoothstep(c, c + w, v);
}

void main() {
  float depth = clamp(0.5 + vWave * 4.0, 0.0, 1.0);
  vec3 base = mix(uDeep, uShallow, depth);
  float stripe = sin((vUv.x + vUv.y) * 32.0 + uTime * 0.6) * 0.5 + 0.5;
  float foam = band(stripe, 0.84, 0.06) * (0.5 + depth * 0.5);
  vec3 col = mix(base, uFoam, foam * 0.7);
  gl_FragColor = vec4(col, 0.86);
}
`;

export default function Ocean({ lod, center, size = 16, shore, toon }: WaterProps) {
  const useToon = toon ?? getDefaultToonMode();
  const waterRef = useRef<Water | null>(null);
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
  
  useEffect(() => {
    if (waterNormals) {
      waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
      waterNormals.repeat.set(4, 4);
    }
  }, [waterNormals]);

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
  
  const geom = useMemo(
    () => new THREE.PlaneGeometry(waterWidth, waterDepth, useToon ? 32 : 8, useToon ? 32 : 8),
    [waterDepth, waterWidth, useToon],
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
      const water = waterRef.current as unknown as {
        material?: THREE.Material;
        dispose?: () => void;
      } | null;
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
      const u = toonMatRef.current?.uniforms?.uTime;
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

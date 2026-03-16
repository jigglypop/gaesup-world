import React, { FC, useEffect, useMemo, useRef } from 'react';

import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

import fragmentShader from './frag.glsl';
import vertexShader from './vert.glsl';

const FireMaterial = shaderMaterial(
  { time: 0, intensity: 1.5, seed: 0, lean: 0, flare: 1, tint: new THREE.Color(1, 1, 1) },
  vertexShader,
  fragmentShader,
);

extend({ FireMaterial });

type FireUniforms = {
  time: number;
  intensity: number;
  seed: number;
  lean: number;
  flare: number;
  tint: THREE.Color;
};

const EMBER_VERT = `
attribute float aLife;
attribute float aSpeed;
attribute float aDrift;
varying float vAlpha;
varying float vHeat;
uniform float uTime;

void main() {
  float t = fract(uTime * aSpeed + aLife);
  vec3 pos = position;
  pos.y += t * 2.8;
  pos.x += sin(t * 6.28318 + aDrift) * 0.14;
  pos.z += cos(t * 5.0 + aDrift * 1.7) * 0.1;
  vAlpha = (1.0 - t) * (1.0 - t) * 0.85;
  vHeat = 1.0 - t;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = mix(3.5, 0.5, t) * (200.0 / -mvPosition.z);
}
`;

const EMBER_FRAG = `
varying float vAlpha;
varying float vHeat;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float glow = 1.0 - d * 2.0;
  vec3 color = mix(vec3(1.0, 0.3, 0.05), vec3(1.0, 0.85, 0.35), vHeat * vHeat);
  gl_FragColor = vec4(color * glow, vAlpha * glow);
}
`;

const EMBER_COUNT = 18;

// --- Shared GPU resources (singleton across all Fire instances) ---

let _sharedGeo: {
  log: THREE.CylinderGeometry;
  charcoal: THREE.CircleGeometry;
  glow: THREE.CircleGeometry;
} | null = null;

let _sharedMat: {
  log: THREE.MeshStandardMaterial;
  charcoal: THREE.MeshStandardMaterial;
  ember: THREE.ShaderMaterial;
} | null = null;

function getSharedGeo() {
  if (!_sharedGeo) {
    _sharedGeo = {
      log: new THREE.CylinderGeometry(0.035, 0.045, 0.5, 5),
      charcoal: new THREE.CircleGeometry(0.18, 6),
      glow: new THREE.CircleGeometry(0.7, 8),
    };
  }
  return _sharedGeo;
}

function getSharedMat() {
  if (!_sharedMat) {
    _sharedMat = {
      log: new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 1 }),
      charcoal: new THREE.MeshStandardMaterial({
        color: 0x111111, roughness: 1,
        emissive: new THREE.Color('#220800'), emissiveIntensity: 0.5,
      }),
      ember: new THREE.ShaderMaterial({
        vertexShader: EMBER_VERT,
        fragmentShader: EMBER_FRAG,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    };
  }
  return _sharedMat;
}

interface FireProps {
  intensity?: number;
  width?: number;
  height?: number;
  color?: string;
}

const Fire: FC<FireProps> = ({ intensity = 1.5, width = 1.0, height = 1.5, color = '#ffffff' }) => {
  const tintColor = useMemo(() => new THREE.Color(color), [color]);
  const matRefs = useRef<(THREE.Material | null)[]>([]);

  const geo = getSharedGeo();
  const mat = getSharedMat();

  const billboardLayers = useMemo(() => [
    { w: width * 0.78, h: height, x: 0, y: height * 0.5, z: 0, seed: 0.17, lean: 0.06, flare: 1.0, speed: 1.45, tOff: 0, iMul: 1.0 },
    { w: width * 0.52, h: height * 0.85, x: -width * 0.12, y: height * 0.43, z: 0.02, seed: 1.31, lean: -0.2, flare: 0.85, speed: 1.9, tOff: 1.7, iMul: 0.82 },
    { w: width * 0.42, h: height * 0.7, x: width * 0.14, y: height * 0.36, z: -0.02, seed: 2.63, lean: 0.16, flare: 0.74, speed: 2.2, tOff: 3.4, iMul: 0.72 },
  ], [width, height]);

  const billboardGeos = useMemo(
    () => billboardLayers.map(l => new THREE.PlaneGeometry(l.w, l.h)),
    [billboardLayers],
  );

  const emberGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(EMBER_COUNT * 3);
    const life = new Float32Array(EMBER_COUNT);
    const speed = new Float32Array(EMBER_COUNT);
    const drift = new Float32Array(EMBER_COUNT);
    for (let i = 0; i < EMBER_COUNT; i++) {
      p[i * 3] = (Math.random() - 0.5) * width * 0.35;
      p[i * 3 + 1] = Math.random() * height * 0.2;
      p[i * 3 + 2] = (Math.random() - 0.5) * width * 0.35;
      life[i] = Math.random();
      speed[i] = 0.12 + Math.random() * 0.22;
      drift[i] = Math.random() * Math.PI * 2;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aLife', new THREE.BufferAttribute(life, 1));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    g.setAttribute('aDrift', new THREE.BufferAttribute(drift, 1));
    return g;
  }, [width, height]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    for (let i = 0; i < billboardLayers.length; i++) {
      const m = matRefs.current[i];
      if (!m) continue;
      const l = billboardLayers[i];
      const u = m as unknown as FireUniforms;
      u.time = t * l.speed + l.tOff;
      u.intensity = intensity * l.iMul;
      u.seed = l.seed;
      u.lean = l.lean;
      u.flare = l.flare;
      u.tint = tintColor;
    }

    mat.ember.uniforms.uTime.value = t;
  });

  useEffect(() => {
    return () => {
      billboardGeos.forEach(g => g.dispose());
      emberGeo.dispose();
    };
  }, [billboardGeos, emberGeo]);

  return (
    <group>
      <mesh
        geometry={geo.glow}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        scale={[width, width, 1]}
      >
        <meshBasicMaterial
          color={tintColor}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh
        geometry={geo.charcoal}
        material={mat.charcoal}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.018, 0]}
        scale={[width, width, 1]}
      />

      <mesh geometry={geo.log} material={mat.log} position={[0.12, 0.06, 0.05]} rotation={[0.3, 0, 0.65]} />
      <mesh geometry={geo.log} material={mat.log} position={[-0.1, 0.06, 0.08]} rotation={[0.25, 1.2, -0.6]} />

      {billboardLayers.map((l, i) => (
        <mesh key={i} geometry={billboardGeos[i]} position={[l.x, l.y, l.z]}>
          <fireMaterial
            ref={(el: THREE.Material | null) => { matRefs.current[i] = el; }}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      <points geometry={emberGeo} material={mat.ember} />
    </group>
  );
};

export default React.memo(Fire);

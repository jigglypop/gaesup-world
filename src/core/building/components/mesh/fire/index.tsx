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

const STATIC_FIRE_VERT = `
varying vec2 vUv;
uniform float seed;
uniform float lean;

void main() {
  vUv = uv;
  vec3 pos = position;
  float bend = lean * pow(clamp(uv.y, 0.0, 1.0), 1.35) * (0.35 + uv.y * 0.65);
  float wobble = sin((uv.y * 6.0 + seed * 5.73) + position.y * 1.15) * 0.04 * uv.y;
  float lift = sin(uv.x * 3.14159 + seed * 3.7) * 0.02 * uv.y;
  pos.x += bend + wobble;
  pos.y += lift;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

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

const EMBER_COUNT = 35;
const LOG_COLOR = 0x2a1a0a;
const CHARCOAL_COLOR = 0x111111;

interface FireProps {
  intensity?: number;
  width?: number;
  height?: number;
  color?: string;
}

const Fire: FC<FireProps> = ({ intensity = 1.5, width = 1.0, height = 1.5, color = '#ffffff' }) => {
  const tintColor = useMemo(() => new THREE.Color(color), [color]);
  const matRefs = useRef<(THREE.Material | null)[]>([]);
  const lightRef = useRef<THREE.PointLight>(null!);

  const billboardLayers = useMemo(() => [
    { w: width * 0.78, h: height, x: 0, y: height * 0.5, z: 0, seed: 0.17, lean: 0.06, flare: 1.0, speed: 1.45, tOff: 0, iMul: 1.0 },
    { w: width * 0.52, h: height * 0.85, x: -width * 0.12, y: height * 0.43, z: 0.02, seed: 1.31, lean: -0.2, flare: 0.85, speed: 1.9, tOff: 1.7, iMul: 0.82 },
    { w: width * 0.42, h: height * 0.7, x: width * 0.14, y: height * 0.36, z: -0.02, seed: 2.63, lean: 0.16, flare: 0.74, speed: 2.2, tOff: 3.4, iMul: 0.72 },
    { w: width * 0.62, h: height * 0.9, x: 0.03, y: height * 0.47, z: -0.06, seed: 3.97, lean: 0.04, flare: 0.95, speed: 1.55, tOff: 0.9, iMul: 0.85 },
  ], [width, height]);

  const billboardGeos = useMemo(
    () => billboardLayers.map(l => new THREE.PlaneGeometry(l.w, l.h)),
    [billboardLayers],
  );

  const crossGeos = useMemo(() => [
    new THREE.PlaneGeometry(width * 0.65, height * 0.88),
    new THREE.PlaneGeometry(width * 0.50, height * 0.78),
  ], [width, height]);

  const crossMats = useMemo(() => [
    new THREE.ShaderMaterial({
      vertexShader: STATIC_FIRE_VERT,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        intensity: { value: 1.5 },
        seed: { value: 4.52 },
        lean: { value: 0.05 },
        flare: { value: 0.92 },
        tint: { value: new THREE.Color(1, 1, 1) },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
    new THREE.ShaderMaterial({
      vertexShader: STATIC_FIRE_VERT,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        intensity: { value: 1.5 },
        seed: { value: 7.13 },
        lean: { value: -0.08 },
        flare: { value: 0.85 },
        tint: { value: new THREE.Color(1, 1, 1) },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
  ], []);

  const logGeo = useMemo(() => new THREE.CylinderGeometry(0.035, 0.045, 0.5, 6), []);
  const charGeo = useMemo(() => new THREE.CircleGeometry(width * 0.18, 8), [width]);
  const glowGeo = useMemo(() => new THREE.CircleGeometry(width * 0.7, 16), [width]);

  const emberGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
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
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    geo.setAttribute('aLife', new THREE.BufferAttribute(life, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    geo.setAttribute('aDrift', new THREE.BufferAttribute(drift, 1));
    return geo;
  }, [width, height]);

  const emberMat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: EMBER_VERT,
      fragmentShader: EMBER_FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    for (let i = 0; i < billboardLayers.length; i++) {
      const mat = matRefs.current[i];
      if (!mat) continue;
      const l = billboardLayers[i];
      const u = mat as unknown as FireUniforms;
      u.time = t * l.speed + l.tOff;
      u.intensity = intensity * l.iMul;
      u.seed = l.seed;
      u.lean = l.lean;
      u.flare = l.flare;
      u.tint = tintColor;
    }

    crossMats[0].uniforms.time.value = t * 1.6 + 1.2;
    crossMats[0].uniforms.intensity.value = intensity * 0.75;
    crossMats[0].uniforms.tint.value = tintColor;
    crossMats[1].uniforms.time.value = t * 1.85 + 3.1;
    crossMats[1].uniforms.intensity.value = intensity * 0.62;
    crossMats[1].uniforms.tint.value = tintColor;

    if (lightRef.current) {
      const flicker = 1.0
        + Math.sin(t * 8.3) * 0.08
        + Math.sin(t * 13.7) * 0.05
        + Math.sin(t * 23.1) * 0.03;
      lightRef.current.intensity = intensity * 2.0 * flicker;
      lightRef.current.color.copy(tintColor);
    }

    emberMat.uniforms.uTime.value = t;
  });

  useEffect(() => {
    return () => {
      billboardGeos.forEach(g => g.dispose());
      crossGeos.forEach(g => g.dispose());
      crossMats.forEach(m => m.dispose());
      logGeo.dispose();
      charGeo.dispose();
      glowGeo.dispose();
      emberGeo.dispose();
      emberMat.dispose();
    };
  }, [billboardGeos, crossGeos, crossMats, logGeo, charGeo, glowGeo, emberGeo, emberMat]);

  return (
    <group>
      <pointLight
        ref={lightRef}
        position={[0, height * 0.5, 0]}
        color={tintColor}
        intensity={intensity * 2.0}
        distance={width * 8}
        decay={2}
      />

      <mesh geometry={glowGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <meshBasicMaterial
          color={tintColor}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh geometry={charGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <meshStandardMaterial
          color={CHARCOAL_COLOR}
          roughness={1}
          emissive="#220800"
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh geometry={logGeo} position={[0.12, 0.06, 0.05]} rotation={[0.3, 0, 0.65]}>
        <meshStandardMaterial color={LOG_COLOR} roughness={1} />
      </mesh>
      <mesh geometry={logGeo} position={[-0.1, 0.06, 0.08]} rotation={[0.25, 1.2, -0.6]}>
        <meshStandardMaterial color={LOG_COLOR} roughness={1} />
      </mesh>
      <mesh geometry={logGeo} position={[0.02, 0.06, -0.12]} rotation={[0.35, 2.4, 0.55]}>
        <meshStandardMaterial color={LOG_COLOR} roughness={1} />
      </mesh>

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

      <mesh
        geometry={crossGeos[0]}
        position={[0, height * 0.45, 0]}
        material={crossMats[0]}
      />
      <mesh
        geometry={crossGeos[1]}
        position={[0, height * 0.42, 0]}
        rotation={[0, Math.PI / 2, 0]}
        material={crossMats[1]}
      />

      <points geometry={emberGeo} material={emberMat} />
    </group>
  );
};

export default React.memo(Fire);

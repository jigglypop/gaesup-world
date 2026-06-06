import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import {
  DEFAULT_MOTIONS_RUNTIME_SERVICE_ID,
  MOTIONS_TELEPORT_EVENT,
  type MotionsRuntimeService,
  type MotionsTeleportPayload,
} from '../../../motions/plugin';
import {
  useGaesupRuntime,
  useGaesupRuntimeRevision,
} from '../../../runtime';

export type TeleportDropEffectProps = {
  enabled?: boolean;
  color?: THREE.ColorRepresentation;
  ringRadius?: number;
  particleCount?: number;
  maxEffects?: number;
};

type TeleportEffectInstance = {
  id: string;
  startedAt: number;
  durationMs: number;
  dropHeight: number;
  position: THREE.Vector3;
  particles: Array<{
    angle: number;
    distance: number;
    height: number;
  }>;
};

type TeleportEffectViewProps = {
  effect: TeleportEffectInstance;
  color: THREE.ColorRepresentation;
  ringRadius: number;
  onDone: (id: string) => void;
};

function readPayload(event: Event): MotionsTeleportPayload | null {
  if (!('detail' in event)) return null;
  const detail = (event as CustomEvent<unknown>).detail;
  if (!detail || typeof detail !== 'object') return null;
  const payload = detail as Partial<MotionsTeleportPayload>;
  const position = payload.position;
  if (!position) return null;
  if (
    typeof position.x !== 'number' ||
    typeof position.y !== 'number' ||
    typeof position.z !== 'number'
  ) {
    return null;
  }
  return payload as MotionsTeleportPayload;
}

function makeParticles(count: number): TeleportEffectInstance['particles'] {
  return Array.from({ length: count }, (_, index) => {
    const t = index / Math.max(1, count);
    return {
      angle: t * Math.PI * 2,
      distance: 0.25 + ((index * 37) % 100) / 100,
      height: 0.2 + ((index * 19) % 100) / 70,
    };
  });
}

function createEffect(
  payload: MotionsTeleportPayload,
  particleCount: number,
): TeleportEffectInstance | null {
  if (payload.effect === undefined) return null;
  const id = payload.effect.id ?? `teleport-effect-${Date.now().toString(36)}`;
  return {
    id,
    startedAt: performance.now(),
    durationMs: payload.effect.durationMs ?? 900,
    dropHeight: payload.effect.dropHeight ?? 0,
    position: new THREE.Vector3(payload.position.x, payload.position.y, payload.position.z),
    particles: makeParticles(particleCount),
  };
}

function TeleportEffectView({
  effect,
  color,
  ringRadius,
  onDone,
}: TeleportEffectViewProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const particleRefs = useRef<Array<THREE.Mesh | null>>([]);
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const beamMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const particleMaterialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const doneRef = useRef(false);
  const beamHeight = Math.max(1.2, effect.dropHeight);

  useFrame(() => {
    if (doneRef.current) return;

    const progress = THREE.MathUtils.clamp(
      (performance.now() - effect.startedAt) / effect.durationMs,
      0,
      1,
    );
    const opacity = 1 - progress;
    const ringScale = 0.45 + progress * ringRadius;

    ringRef.current?.scale.set(ringScale, ringScale, 1);
    if (ringMaterialRef.current) ringMaterialRef.current.opacity = opacity * 0.55;

    if (beamRef.current) {
      beamRef.current.position.y = beamHeight * (0.5 - progress * 0.15);
    }
    if (beamMaterialRef.current) beamMaterialRef.current.opacity = opacity * 0.16;

    for (let index = 0; index < effect.particles.length; index++) {
      const particle = effect.particles[index];
      const mesh = particleRefs.current[index];
      if (!particle || !mesh) continue;

      const distance = particle.distance * ringScale;
      mesh.position.set(
        Math.cos(particle.angle) * distance,
        particle.height * (1 - progress),
        Math.sin(particle.angle) * distance,
      );
      mesh.scale.setScalar(0.08 + opacity * 0.06);
      const material = particleMaterialRefs.current[index];
      if (material) material.opacity = opacity * 0.8;
    }

    if (progress >= 1) {
      doneRef.current = true;
      onDone(effect.id);
    }
  });

  return (
    <group position={effect.position}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} scale={[0.45, 0.45, 1]}>
        <ringGeometry args={[0.78, 1, 40]} />
        <meshBasicMaterial
          ref={ringMaterialRef}
          color={color}
          transparent
          opacity={0.55}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={beamRef} position={[0, beamHeight * 0.5, 0]}>
        <cylinderGeometry args={[0.18, 0.42, beamHeight, 18, 1, true]} />
        <meshBasicMaterial
          ref={beamMaterialRef}
          color={color}
          transparent
          opacity={0.16}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {effect.particles.map((particle, index) => (
        <mesh
          key={index}
          ref={(node) => {
            particleRefs.current[index] = node;
          }}
          position={[
            Math.cos(particle.angle) * particle.distance * 0.45,
            particle.height,
            Math.sin(particle.angle) * particle.distance * 0.45,
          ]}
          scale={0.14}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            ref={(node) => {
              particleMaterialRefs.current[index] = node;
            }}
            color={color}
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export function TeleportDropEffect({
  enabled = true,
  color = '#70d6ff',
  ringRadius = 1.35,
  particleCount = 14,
  maxEffects = 6,
}: TeleportDropEffectProps = {}) {
  const runtime = useGaesupRuntime();
  const runtimeRevision = useGaesupRuntimeRevision();
  const [effects, setEffects] = useState<TeleportEffectInstance[]>([]);
  const motionsRuntime = useMemo(() => {
    if (!runtime) return null;
    const service = runtime.getService<MotionsRuntimeService>(DEFAULT_MOTIONS_RUNTIME_SERVICE_ID);
    return service?.create() ?? null;
  }, [runtime, runtimeRevision]);
  const removeEffect = useCallback((id: string) => {
    setEffects((items) => items.filter((effect) => effect.id !== id));
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    const addEffect = (payload: MotionsTeleportPayload) => {
      const effect = createEffect(payload, particleCount);
      if (!effect) return;
      setEffects((items) => [...items, effect].slice(-maxEffects));
    };

    const unsubscribeRuntime = motionsRuntime?.events.on<MotionsTeleportPayload>(
      MOTIONS_TELEPORT_EVENT,
      addEffect,
    );
    const domListener = (event: Event) => {
      const payload = readPayload(event);
      if (payload) addEffect(payload);
    };
    window.addEventListener('gaesup:teleport', domListener);
    document.addEventListener('teleport-request', domListener);

    return () => {
      unsubscribeRuntime?.();
      window.removeEventListener('gaesup:teleport', domListener);
      document.removeEventListener('teleport-request', domListener);
    };
  }, [enabled, maxEffects, motionsRuntime, particleCount]);

  if (!enabled || effects.length === 0) return null;

  return (
    <>
      {effects.map((effect) => (
        <TeleportEffectView
          key={effect.id}
          effect={effect}
          color={color}
          ringRadius={ringRadius}
          onDone={removeEffect}
        />
      ))}
    </>
  );
}

export default TeleportDropEffect;

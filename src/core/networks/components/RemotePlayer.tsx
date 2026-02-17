import React, { useRef, useEffect, useMemo } from 'react';

import { Text, useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { weightFromDistance } from '@core/utils/sfe';

import { SpeechBalloon } from '../../ui/components/SpeechBalloon';
import { PlayerState, MultiplayerConfig } from '../types';

interface RemotePlayerProps {
  playerId: string;
  state: PlayerState;
  characterUrl?: string;
  config?: MultiplayerConfig;
  speechText?: string;
}

export const RemotePlayer = React.memo(function RemotePlayer({ state, characterUrl, config, speechText }: RemotePlayerProps) {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const meshRef = useRef<THREE.Group | null>(null);
  const initialPosition = useRef<[number, number, number] | null>(null);
  if (!initialPosition.current) {
    initialPosition.current = [state.position[0], state.position[1], state.position[2]];
  }
  
  // 목표 위치와 회전
  const targetPosition = useRef(new THREE.Vector3());
  const targetRotation = useRef(new THREE.Quaternion());
  const currentVelocity = useRef(new THREE.Vector3());
  const lastNetUpdateAt = useRef<number>(performance.now());
  const tmpPos = useRef(new THREE.Vector3());
  const tmpRot = useRef(new THREE.Quaternion());
  const predictedPos = useRef(new THREE.Vector3());

  // Critically-damped smoothing state (stable across FPS).
  const smoothPos = useRef(new THREE.Vector3());
  const smoothVel = useRef(new THREE.Vector3());
  const smoothRot = useRef(new THREE.Quaternion());
  const smoothInit = useRef(false);
  const sdChange = useRef(new THREE.Vector3());
  const sdTemp = useRef(new THREE.Vector3());
  const sdOrigTo = useRef(new THREE.Vector3());
  const sdAdjustedTarget = useRef(new THREE.Vector3());
  const sdV1 = useRef(new THREE.Vector3());
  const sdV2 = useRef(new THREE.Vector3());

  // Reused objects to avoid per-frame allocations.
  const nextTranslation = useRef({ x: 0, y: 0, z: 0 });
  const nextRotation = useRef({ x: 0, y: 0, z: 0, w: 1 });

  // LOD/throttle state (SFE-style suppression w = exp(-sigma(distance))).
  const lodAccum = useRef<number>(0);
  const lodInterval = useRef<number>(0);
  
  // URL 가져오기 - props에서 먼저, 없으면 state에서
  const modelUrl = characterUrl || state.modelUrl || '';
  if (!modelUrl) return null;

  const normalizeHexColor = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const v = value.trim();
    if (!v) return null;
    const withHash = v.startsWith('#') ? v : `#${v}`;
    // Accept #RGB and #RRGGBB
    if (/^#[0-9a-fA-F]{3}$/.test(withHash)) return withHash;
    if (/^#[0-9a-fA-F]{6}$/.test(withHash)) return withHash;
    return null;
  };
  const playerColor = useMemo(() => normalizeHexColor(state.color), [state.color]);
  
  // 설정값 가져오기
  const interpolationSpeed = config?.tracking?.interpolationSpeed || 0.15;
  const characterScale = config?.rendering?.characterScale || 1;
  const nameTagHeight = config?.rendering?.nameTagHeight || 3.5;
  const nameTagSize = config?.rendering?.nameTagSize || 0.5;
  
  // 모델 로드
  const { scene, animations } = useGLTF(modelUrl);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions, ref: animationRef } = useAnimations(animations, meshRef);
  const tintedMaterialsRef = useRef<THREE.Material[]>([]);
  const currentAnimRef = useRef<string | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const lastAnimSwitchAt = useRef<number>(performance.now());
  const speechPos = useRef(new THREE.Vector3());

  // Apply per-player tint (material cloning) once per model/color.
  useEffect(() => {
    // Dispose previously created materials (if any).
    for (const m of tintedMaterialsRef.current) {
      try {
        m.dispose();
      } catch {
        // ignore
      }
    }
    tintedMaterialsRef.current = [];

    if (!playerColor) return;

    const tintMaterial = (mat: THREE.Material): THREE.Material => {
      const anyMat = mat as unknown as { color?: { set?: (c: string) => void } };
      if (!anyMat?.color || typeof anyMat.color.set !== 'function') return mat;

      const cloned = mat.clone();
      const c = cloned as unknown as { color?: { set?: (c: string) => void } };
      c.color?.set?.(playerColor);
      tintedMaterialsRef.current.push(cloned);
      return cloned;
    };

    clone.traverse((obj) => {
      const mesh = obj as unknown as {
        isMesh?: boolean;
        isSkinnedMesh?: boolean;
        material?: THREE.Material | THREE.Material[];
      };
      if (!mesh || (!mesh.isMesh && !mesh.isSkinnedMesh) || !mesh.material) return;

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((m) => tintMaterial(m));
      } else {
        mesh.material = tintMaterial(mesh.material);
      }
    });

    return () => {
      for (const m of tintedMaterialsRef.current) {
        try {
          m.dispose();
        } catch {
          // ignore
        }
      }
      tintedMaterialsRef.current = [];
    };
  }, [clone, playerColor]);

  const pickAction = (desired: string): THREE.AnimationAction | null => {
    if (!actions) return null;
    const direct = actions[desired];
    if (direct) return direct;

    const lower = desired.toLowerCase();
    const keys = Object.keys(actions);
    const byIncludes = keys.find((k) => k.toLowerCase().includes(lower));
    if (byIncludes) return actions[byIncludes] ?? null;

    // Common fallback names
    if (lower === 'run') {
      const k = keys.find((x) => x.toLowerCase().includes('walk')) ?? keys[0];
      return k ? (actions[k] ?? null) : null;
    }
    if (lower === 'idle') {
      const k = keys.find((x) => x.toLowerCase().includes('idle')) ?? keys[0];
      return k ? (actions[k] ?? null) : null;
    }

    return keys[0] ? (actions[keys[0]] ?? null) : null;
  };

  const smoothDampVec3 = (
    current: THREE.Vector3,
    target: THREE.Vector3,
    currentVelocity: THREE.Vector3,
    smoothTime: number,
    maxSpeed: number,
    deltaTime: number,
    out: THREE.Vector3,
  ): void => {
    // Port of Unity's SmoothDamp (critically damped spring), adapted for Vector3.
    const st = Math.max(0.0001, smoothTime);
    const dt = Math.max(0, deltaTime);
    const omega = 2 / st;
    const x = omega * dt;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

    sdOrigTo.current.copy(target);
    sdChange.current.copy(current).sub(target);

    // Clamp maximum change (prevents extreme overshoot after long stalls).
    const maxChange = maxSpeed * st;
    const changeLen = sdChange.current.length();
    if (changeLen > maxChange && changeLen > 0) {
      sdChange.current.multiplyScalar(maxChange / changeLen);
    }

    sdAdjustedTarget.current.copy(current).sub(sdChange.current);

    // Integrate velocity.
    // temp = (currentVelocity + omega * change) * dt
    sdTemp.current.copy(currentVelocity).addScaledVector(sdChange.current, omega).multiplyScalar(dt);
    // currentVelocity = (currentVelocity - omega * temp) * exp
    currentVelocity.addScaledVector(sdTemp.current, -omega).multiplyScalar(exp);

    // out = adjustedTarget + (change + temp) * exp
    out.copy(sdChange.current).add(sdTemp.current).multiplyScalar(exp).add(sdAdjustedTarget.current);

    // Prevent overshooting the target.
    sdV1.current.copy(sdOrigTo.current).sub(current);
    sdV2.current.copy(out).sub(sdOrigTo.current);
    if (sdV1.current.dot(sdV2.current) > 0) {
      out.copy(sdOrigTo.current);
      currentVelocity.set(0, 0, 0);
    }
  };
  
  // 애니메이션 업데이트 (stop-all 금지: 끊김/튐 원인)
  useEffect(() => {
    if (!actions) return;

    const base = config?.tracking?.velocityThreshold ?? 0.5;
    const runThreshold = base;
    const idleThreshold = base * 0.6;
    const minSwitchMs = 180;

    const speed = state.velocity
      ? Math.hypot(state.velocity[0], state.velocity[1], state.velocity[2])
      : currentVelocity.current.length();

    const requested = state.animation?.trim();
    const fallback =
      (currentAnimRef.current ?? 'idle') === 'run'
        ? (speed < idleThreshold ? 'idle' : 'run')
        : (speed > runThreshold ? 'run' : 'idle');

    const nextName = (requested && requested.length > 0 ? requested : fallback) || 'idle';
    if (currentAnimRef.current === nextName) return;

    const now = performance.now();
    if (now - lastAnimSwitchAt.current < minSwitchMs) return;

    const next = pickAction(nextName);
    if (!next) return;

    const prev = currentActionRef.current;
    // Smooth transition between actions without resetting all tracks.
    next.enabled = true;
    next.setEffectiveTimeScale(1);
    next.setEffectiveWeight(1);
    next.reset().play();
    if (prev && prev !== next) {
      next.crossFadeFrom(prev, 0.18, true);
    } else {
      next.fadeIn(0.18);
    }

    currentAnimRef.current = nextName;
    currentActionRef.current = next;
    lastAnimSwitchAt.current = now;

    return () => {
      // Keep it simple: do not stop() everything on unmount;
      // drei/GLTF cleanup will dispose actions with the scene.
    };
  }, [actions, state.animation, state.velocity, config?.tracking?.velocityThreshold]);

  // 상태 업데이트 시 목표값 설정
  useEffect(() => {
    lastNetUpdateAt.current = performance.now();
    targetPosition.current.set(
      state.position[0],
      state.position[1], 
      state.position[2]
    );
    speechPos.current.set(state.position[0], state.position[1], state.position[2]);

    // First network state: snap smoothing state to avoid "slide from origin".
    if (!smoothInit.current && bodyRef.current) {
      const p = targetPosition.current;
      smoothInit.current = true;
      smoothPos.current.copy(p);
      smoothVel.current.set(0, 0, 0);
      smoothRot.current.copy(targetRotation.current);

      const body = bodyRef.current as unknown as {
        setNextKinematicTranslation?: (t: { x: number; y: number; z: number }) => void;
        setNextKinematicRotation?: (r: { x: number; y: number; z: number; w: number }) => void;
        setTranslation?: (t: { x: number; y: number; z: number }, wakeUp: boolean) => void;
        setRotation?: (r: THREE.Quaternion, wakeUp: boolean) => void;
      };
      const t = nextTranslation.current;
      t.x = p.x;
      t.y = p.y;
      t.z = p.z;
      body.setNextKinematicTranslation?.(t);

      const q = nextRotation.current;
      q.x = targetRotation.current.x;
      q.y = targetRotation.current.y;
      q.z = targetRotation.current.z;
      q.w = targetRotation.current.w;
      body.setNextKinematicRotation?.(q);
    }
    
    // Prefer (w, x, y, z). Some older senders may send identity as (x, y, z, w) = (0,0,0,1).
    const r = state.rotation;
    const looksLikeXyzwIdentity =
      Math.abs(r[0]) < 1e-6 && Math.abs(r[1]) < 1e-6 && Math.abs(r[2]) < 1e-6 && Math.abs(r[3] - 1) < 1e-6;
    const wxyz = looksLikeXyzwIdentity ? ([1, 0, 0, 0] as const) : r;
    targetRotation.current.set(
      wxyz[1],
      wxyz[2],
      wxyz[3],
      wxyz[0]
    );
    
    // 속도 업데이트
    if (state.velocity) {
      currentVelocity.current.set(
        state.velocity[0],
        state.velocity[1],
        state.velocity[2]
      );
    }
  }, [state.position, state.rotation, state.velocity]);

  // 부드러운 보간
  useFrame((frame, delta) => {
    if (!bodyRef.current || !meshRef.current) return;

    // Distance-based throttling: far objects update less frequently.
    // Use the last chosen interval for early returns to avoid doing distance math every frame.
    const currentInterval = lodInterval.current;
    if (currentInterval > 0) {
      lodAccum.current += Math.max(0, delta);
      if (lodAccum.current < currentInterval) return;
      lodAccum.current = 0;
    } else {
      lodAccum.current = 0;
    }

    // Update the interval at the same cadence as the simulation update.
    const approx = smoothInit.current ? smoothPos.current : targetPosition.current;
    const cameraDist = frame.camera.position.distanceTo(approx);
    const w = smoothInit.current ? weightFromDistance(cameraDist, 25, 140, 4) : 1;
    lodInterval.current =
      w >= 0.7
        ? 0
        : w >= 0.4
        ? 1 / 30
        : w >= 0.2
        ? 1 / 15
        : 1 / 8;

    // Short prediction to hide network jitter (up to 120ms).
    const sinceNet = (performance.now() - lastNetUpdateAt.current) / 1000;
    const predictT = Math.max(0, Math.min(0.12, sinceNet));
    predictedPos.current.copy(targetPosition.current).addScaledVector(currentVelocity.current, predictT);

    // Initialize smoothing state from current body transform.
    if (!smoothInit.current) {
      // Only query Rapier transforms when we actually need them; translation()/rotation()
      // allocate in the JS/WASM boundary on some builds.
      const pos = bodyRef.current.translation();
      const rot = bodyRef.current.rotation();
      smoothInit.current = true;
      smoothPos.current.set(pos.x, pos.y, pos.z);
      smoothVel.current.set(0, 0, 0);
      smoothRot.current.set(rot.x, rot.y, rot.z, rot.w);
    }

    // Smooth time mapping: higher interpolationSpeed => shorter time constant.
    const base = Math.max(0.01, Math.min(0.9, interpolationSpeed));
    const smoothTime = Math.max(0.03, Math.min(0.22, 0.03 + (1 - base) * 0.19));
    const maxSpeed = 120; // world units/sec; effectively "no clamp" but avoids blow-ups on stalls.

    // Snap if far behind (teleports / missed packets / long frame stall).
    const dist = smoothPos.current.distanceTo(predictedPos.current);
    if (dist > 10 || delta > 0.25) {
      smoothPos.current.copy(predictedPos.current);
      smoothVel.current.set(0, 0, 0);
      smoothRot.current.copy(targetRotation.current);
    } else {
      smoothDampVec3(
        smoothPos.current,
        predictedPos.current,
        smoothVel.current,
        smoothTime,
        maxSpeed,
        delta,
        tmpPos.current,
      );
      smoothPos.current.copy(tmpPos.current);

      // Rotation uses exponential smoothing (stable across FPS).
      const rotTime = Math.max(0.025, smoothTime * 0.7);
      const rotAlpha = 1 - Math.exp(-Math.max(0, delta) / rotTime);
      tmpRot.current.copy(smoothRot.current).slerp(targetRotation.current, rotAlpha);
      smoothRot.current.copy(tmpRot.current);
    }

    // Keep speech position tracking the smoothed body position (no rerender needed).
    speechPos.current.copy(smoothPos.current);

    // RigidBody 업데이트
    // Rapier kinematic bodies should be driven via "next kinematic" setters.
    const body = bodyRef.current as unknown as {
      setNextKinematicTranslation?: (t: { x: number; y: number; z: number }) => void;
      setNextKinematicRotation?: (r: { x: number; y: number; z: number; w: number }) => void;
      setTranslation?: (t: { x: number; y: number; z: number }, wakeUp: boolean) => void;
      setRotation?: (r: THREE.Quaternion, wakeUp: boolean) => void;
    };

    const t = nextTranslation.current;
    t.x = smoothPos.current.x;
    t.y = smoothPos.current.y;
    t.z = smoothPos.current.z;
    if (typeof body.setNextKinematicTranslation === 'function') {
      body.setNextKinematicTranslation(t);
    } else {
      body.setTranslation?.(t, true);
    }

    const q = nextRotation.current;
    q.x = smoothRot.current.x;
    q.y = smoothRot.current.y;
    q.z = smoothRot.current.z;
    q.w = smoothRot.current.w;
    if (typeof body.setNextKinematicRotation === 'function') {
      body.setNextKinematicRotation(q);
    } else {
      body.setRotation?.(smoothRot.current, true);
    }
    
    // Animation switching is handled in the effect above (with hysteresis).
  });

  return (
    <group>
      <RigidBody
        ref={bodyRef}
        type="kinematicPosition"
        // Important: do NOT bind position to network state.
        // Kinematic bodies are driven by setNextKinematicTranslation/Rotation in the frame loop.
        position={initialPosition.current ?? undefined}
        colliders={false}
      >
        <CapsuleCollider args={[0.5, 0.5]} position={[0, 1.5, 0]} />
        <group ref={meshRef}>
          <group ref={animationRef} scale={[characterScale, characterScale, characterScale]}>
            <primitive object={clone} />
          </group>
        </group>

        {/* 이름표: rigidbody 아래로 넣어서 스무딩된 위치를 그대로 따라감 */}
        <Text
          position={[0, nameTagHeight, 0]}
          fontSize={nameTagSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="black"
        >
          {state.name}
        </Text>
      </RigidBody>

      {/* 말풍선 */}
      {speechText ? (
        <SpeechBalloon
          text={speechText}
          position={speechPos.current}
        />
      ) : null}
    </group>
  );
}); 
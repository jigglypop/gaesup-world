import React, { useRef, useEffect, useMemo, useState } from 'react';

import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { Text } from '@/core/rendering/legacyDrei';
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

type RemotePlayerContentProps = {
  state: PlayerState;
  config: MultiplayerConfig | undefined;
  speechText: string | undefined;
  modelUrl: string;
};

type ColorableMaterial = THREE.Material & { color: THREE.Color };

function isColorableMaterial(material: THREE.Material): material is ColorableMaterial {
  return 'color' in material && material.color instanceof THREE.Color;
}

function RemotePlayerContent({ state, config, speechText, modelUrl }: RemotePlayerContentProps) {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const meshRef = useRef<THREE.Group | null>(null);
  const animationRootRef = useRef<THREE.Group | null>(null);
  const initialPosition = useRef<[number, number, number] | null>(null);
  if (!initialPosition.current) {
    initialPosition.current = [state.position[0], state.position[1], state.position[2]];
  }
  
  const [{
    targetPosition,
    targetRotation,
    currentVelocity,
    tmpPos,
    tmpRot,
    predictedPos,
    smoothPos,
    smoothVel,
    smoothRot,
    sdChange,
    sdTemp,
    sdOrigTo,
    sdAdjustedTarget,
    sdV1,
    sdV2,
    speechPos,
    nextTranslation,
    nextRotation,
  }] = useState(() => ({
    targetPosition: new THREE.Vector3(),
    targetRotation: new THREE.Quaternion(),
    currentVelocity: new THREE.Vector3(),
    tmpPos: new THREE.Vector3(),
    tmpRot: new THREE.Quaternion(),
    predictedPos: new THREE.Vector3(),
    smoothPos: new THREE.Vector3(),
    smoothVel: new THREE.Vector3(),
    smoothRot: new THREE.Quaternion(),
    sdChange: new THREE.Vector3(),
    sdTemp: new THREE.Vector3(),
    sdOrigTo: new THREE.Vector3(),
    sdAdjustedTarget: new THREE.Vector3(),
    sdV1: new THREE.Vector3(),
    sdV2: new THREE.Vector3(),
    speechPos: new THREE.Vector3(),
    nextTranslation: { x: 0, y: 0, z: 0 },
    nextRotation: { x: 0, y: 0, z: 0, w: 1 },
  }));

  const lastNetUpdateAt = useRef<number>(performance.now());

  // Critically-damped smoothing state (stable across FPS).
  const smoothInit = useRef(false);

  // LOD/throttle state (SFE-style suppression w = exp(-sigma(distance))).
  const lodAccum = useRef<number>(0);
  const lodInterval = useRef<number>(0);
  
  const normalizeHexColor = (value: string | null | undefined): string | null => {
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
  useEffect(() => () => {
    clone.traverse((object) => {
      if (object instanceof THREE.SkinnedMesh) object.skeleton.dispose();
    });
  }, [clone]);
  const { actions } = useAnimations(animations, animationRootRef);
  const currentAnimRef = useRef<string | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const lastAnimSwitchAt = useRef<number>(performance.now());
  useEffect(() => {
    currentAnimRef.current = null;
    currentActionRef.current = null;
  }, [actions]);

  // Apply per-player tint (material cloning) once per model/color.
  useEffect(() => {
    if (!playerColor) return;
    const originals = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
    const tinted = new Map<THREE.Material, THREE.Material>();
    const cleanup = () => {
      for (const [mesh, material] of originals) mesh.material = material;
      originals.clear();
      for (const material of tinted.values()) {
        try {
          material.dispose();
        } catch {
          // Continue releasing the remaining owned materials.
        }
      }
      tinted.clear();
    };

    const tintMaterial = (mat: THREE.Material): THREE.Material => {
      if (!isColorableMaterial(mat)) return mat;
      const existing = tinted.get(mat);
      if (existing) return existing;
      const cloned: THREE.Material = mat.clone();
      tinted.set(mat, cloned);
      if (!isColorableMaterial(cloned)) {
        cloned.dispose();
        tinted.delete(mat);
        return mat;
      }
      cloned.color.set(playerColor);
      return cloned;
    };

    try {
      clone.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh) || !obj.material) return;
        originals.set(obj, obj.material);
        if (Array.isArray(obj.material)) {
          obj.material = obj.material.map(tintMaterial);
        } else {
          obj.material = tintMaterial(obj.material);
        }
      });
    } catch (error) {
      cleanup();
      throw error;
    }
    return cleanup;
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

    sdOrigTo.copy(target);
    sdChange.copy(current).sub(target);

    // Clamp maximum change (prevents extreme overshoot after long stalls).
    const maxChange = maxSpeed * st;
    const changeLen = sdChange.length();
    if (changeLen > maxChange && changeLen > 0) {
      sdChange.multiplyScalar(maxChange / changeLen);
    }

    sdAdjustedTarget.copy(current).sub(sdChange);

    // Integrate velocity.
    // temp = (currentVelocity + omega * change) * dt
    sdTemp.copy(currentVelocity).addScaledVector(sdChange, omega).multiplyScalar(dt);
    // currentVelocity = (currentVelocity - omega * temp) * exp
    currentVelocity.addScaledVector(sdTemp, -omega).multiplyScalar(exp);

    // out = adjustedTarget + (change + temp) * exp
    out.copy(sdChange).add(sdTemp).multiplyScalar(exp).add(sdAdjustedTarget);

    // Prevent overshooting the target.
    sdV1.copy(sdOrigTo).sub(current);
    sdV2.copy(out).sub(sdOrigTo);
    if (sdV1.dot(sdV2) > 0) {
      out.copy(sdOrigTo);
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
      : currentVelocity.length();

    const requested = state.animation?.trim();
    const fallback =
      (currentAnimRef.current ?? 'idle') === 'run'
        ? (speed < idleThreshold ? 'idle' : 'run')
        : (speed > runThreshold ? 'run' : 'idle');

    const nextName = (requested && requested.length > 0 ? requested : fallback) || 'idle';
    if (currentAnimRef.current === nextName) return;

    const next = pickAction(nextName);
    if (!next) return;

    const play = () => {
      const prev = currentActionRef.current;
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
      lastAnimSwitchAt.current = performance.now();
    };
    const delay = currentActionRef.current
      ? minSwitchMs - (performance.now() - lastAnimSwitchAt.current)
      : 0;
    if (delay <= 0) {
      play();
      return;
    }
    const timer = setTimeout(play, delay);
    return () => clearTimeout(timer);
  }, [actions, state.animation, state.velocity, config?.tracking?.velocityThreshold]);

  // 상태 업데이트 시 목표값 설정
  useEffect(() => {
    lastNetUpdateAt.current = performance.now();
    targetPosition.set(
      state.position[0],
      state.position[1], 
      state.position[2]
    );
    speechPos.set(state.position[0], state.position[1], state.position[2]);
    const [w, x, y, z] = state.rotation;
    targetRotation.set(x, y, z, w);

    // First network state: snap smoothing state to avoid "slide from origin".
    if (!smoothInit.current && bodyRef.current) {
      const p = targetPosition;
      smoothInit.current = true;
      smoothPos.copy(p);
      smoothVel.set(0, 0, 0);
      smoothRot.copy(targetRotation);

      const body = bodyRef.current;
      const t = nextTranslation;
      t.x = p.x;
      t.y = p.y;
      t.z = p.z;
      body.setNextKinematicTranslation(t);

      const q = nextRotation;
      q.x = targetRotation.x;
      q.y = targetRotation.y;
      q.z = targetRotation.z;
      q.w = targetRotation.w;
      body.setNextKinematicRotation(q);
    }
    
    // 속도 업데이트
    if (state.velocity) {
      currentVelocity.set(
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
    lodAccum.current += Math.max(0, delta);
    if (lodAccum.current < currentInterval) return;
    const elapsed = lodAccum.current;
    lodAccum.current = 0;

    // Update the interval at the same cadence as the simulation update.
    const approx = smoothInit.current ? smoothPos : targetPosition;
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
    predictedPos.copy(targetPosition).addScaledVector(currentVelocity, predictT);

    // Initialize smoothing state from current body transform.
    if (!smoothInit.current) {
      // Only query Rapier transforms when we actually need them; translation()/rotation()
      // allocate in the JS/WASM boundary on some builds.
      const pos = bodyRef.current.translation();
      const rot = bodyRef.current.rotation();
      smoothInit.current = true;
      smoothPos.set(pos.x, pos.y, pos.z);
      smoothVel.set(0, 0, 0);
      smoothRot.set(rot.x, rot.y, rot.z, rot.w);
    }

    // Smooth time mapping: higher interpolationSpeed => shorter time constant.
    const base = Math.max(0.01, Math.min(0.9, interpolationSpeed));
    const smoothTime = Math.max(0.03, Math.min(0.22, 0.03 + (1 - base) * 0.19));
    const maxSpeed = 120; // world units/sec; effectively "no clamp" but avoids blow-ups on stalls.

    // Snap if far behind (teleports / missed packets / long frame stall).
    const dist = smoothPos.distanceTo(predictedPos);
    if (dist > 10 || elapsed > 0.25) {
      smoothPos.copy(predictedPos);
      smoothVel.set(0, 0, 0);
      smoothRot.copy(targetRotation);
    } else {
      smoothDampVec3(
        smoothPos,
        predictedPos,
        smoothVel,
        smoothTime,
        maxSpeed,
        elapsed,
        tmpPos,
      );
      smoothPos.copy(tmpPos);

      // Rotation uses exponential smoothing (stable across FPS).
      const rotTime = Math.max(0.025, smoothTime * 0.7);
      const rotAlpha = 1 - Math.exp(-elapsed / rotTime);
      tmpRot.copy(smoothRot).slerp(targetRotation, rotAlpha);
      smoothRot.copy(tmpRot);
    }

    // Keep speech position tracking the smoothed body position (no rerender needed).
    speechPos.copy(smoothPos);

    // RigidBody 업데이트
    // Rapier kinematic bodies should be driven via "next kinematic" setters.
    const body = bodyRef.current;

    const t = nextTranslation;
    t.x = smoothPos.x;
    t.y = smoothPos.y;
    t.z = smoothPos.z;
    body.setNextKinematicTranslation(t);

    const q = nextRotation;
    q.x = smoothRot.x;
    q.y = smoothRot.y;
    q.z = smoothRot.z;
    q.w = smoothRot.w;
    body.setNextKinematicRotation(q);
    
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
          <group ref={animationRootRef} scale={[characterScale, characterScale, characterScale]}>
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
          position={speechPos}
        />
      ) : null}
    </group>
  );
}

export const RemotePlayer = React.memo(function RemotePlayer({
  state,
  characterUrl,
  config,
  speechText,
}: RemotePlayerProps) {
  const modelUrl = characterUrl || state.modelUrl || '';
  if (!modelUrl) return null;

  return (
    <RemotePlayerContent
      state={state}
      config={config}
      speechText={speechText}
      modelUrl={modelUrl}
    />
  );
});

import React, { Suspense, useCallback, useRef, useEffect, useMemo, useState } from 'react';

import { useGLTF, useAnimations } from '@react-three/drei';
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { Text } from '@/core/rendering/legacyDrei';
import { useSharedFrame, type SharedFrameChannel } from '@core/runtime/frame';

import { GaesupErrorBoundary } from '../../error';
import { SpeechBalloon } from '../../ui/components/SpeechBalloon';
import { logger } from '../../utils/logger';
import { isTrustedRemoteModelUrl } from '../core/remoteInputLimits';
import {
  createRemoteMotion,
  DEFAULT_REMOTE_VELOCITY_THRESHOLD,
  stepRemoteMotion,
  syncRemoteMotion,
  type RemoteAppearance,
  type RemoteMotion,
} from '../core/remoteMotion';
import { PlayerState, MultiplayerConfig } from '../types';

interface RemotePlayerProps {
  playerId: string;
  state: PlayerState;
  characterUrl?: string;
  config?: MultiplayerConfig;
  speechText?: string;
  allowedModelOrigins?: readonly string[];
}

export type RemoteAvatarProps = {
  motion: RemoteMotion;
  appearance: RemoteAppearance;
  characterUrl?: string | undefined;
  config?: MultiplayerConfig | undefined;
  speechText?: string | undefined;
  allowedModelOrigins?: readonly string[] | undefined;
};

type RemotePlayerContentProps = {
  motion: RemoteMotion;
  appearance: RemoteAppearance;
  config: MultiplayerConfig | undefined;
  speechText: string | undefined;
  modelUrl: string;
};

type ColorableMaterial = THREE.Material & { color: THREE.Color };

const REMOTE_MODEL_FALLBACK = <group name="remote-player-model-fallback" />;
/** Remote avatars never block the camera or other ray probes, matching the local player. */
const INTANGIBLE = { intangible: true };
/** Every remote avatar interpolates inside this one scheduler entry. */
const REMOTE_PLAYER_FRAME: SharedFrameChannel = { phase: 'prePhysics', label: 'network:remote-player' };
const CAPSULE_ARGS: [number, number] = [0.5, 0.5];
const CAPSULE_OFFSET: [number, number, number] = [0, 1.5, 0];

function isColorableMaterial(material: THREE.Material): material is ColorableMaterial {
  return 'color' in material && material.color instanceof THREE.Color;
}

function normalizeHexColor(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (!v) return null;
  const withHash = v.startsWith('#') ? v : `#${v}`;
  // Accept #RGB and #RRGGBB
  if (/^#[0-9a-fA-F]{3}$/.test(withHash)) return withHash;
  if (/^#[0-9a-fA-F]{6}$/.test(withHash)) return withHash;
  return null;
}

/** Kinematic bodies are driven through the next-kinematic setters, never through props. */
function placeBody(body: RapierRigidBody, motion: RemoteMotion): void {
  body.setNextKinematicTranslation(motion.position);
  body.setNextKinematicRotation(motion.rotation);
}

const RemotePlayerContent = React.memo(function RemotePlayerContent({
  motion,
  appearance,
  config,
  speechText,
  modelUrl,
}: RemotePlayerContentProps) {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const meshRef = useRef<THREE.Group | null>(null);
  const animationRootRef = useRef<THREE.Group | null>(null);
  const [initialPosition] = useState((): [number, number, number] => [motion.position.x, motion.position.y, motion.position.z]);
  const playerColor = useMemo(() => normalizeHexColor(appearance.color), [appearance.color]);
  
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

  // 애니메이션 업데이트 (stop-all 금지: 끊김/튐 원인)
  useEffect(() => {
    if (!actions) return;

    const minSwitchMs = 180;
    const nextName = appearance.animation || 'idle';
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
  }, [actions, appearance.animation]);

  // The first network state already placed the motion; snap the new body there.
  useEffect(() => {
    const body = bodyRef.current;
    if (body) placeBody(body, motion);
  }, [motion]);

  // 부드러운 보간: network messages only write targets; the pose moves here, never through React.
  useSharedFrame(REMOTE_PLAYER_FRAME, (delta, _elapsedSeconds, three) => {
    const body = bodyRef.current;
    if (!body || !meshRef.current) return;
    if (stepRemoteMotion(motion, delta, three.camera.position, interpolationSpeed)) placeBody(body, motion);
  });

  return (
    <group userData={INTANGIBLE}>
      <RigidBody
        ref={bodyRef}
        type="kinematicPosition"
        // Important: do NOT bind position to network state.
        // Kinematic bodies are driven by setNextKinematicTranslation/Rotation in the frame loop.
        position={initialPosition}
        colliders={false}
      >
        <CapsuleCollider args={CAPSULE_ARGS} position={CAPSULE_OFFSET} />
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
          {appearance.name}
        </Text>
      </RigidBody>

      {/* 말풍선 */}
      {speechText ? (
        <SpeechBalloon
          text={speechText}
          position={motion.position}
        />
      ) : null}
    </group>
  );
});

/** One avatar driven by a motion its owner keeps current; renders again only when its props change. */
export const RemoteAvatar = React.memo(function RemoteAvatar({
  motion,
  appearance,
  characterUrl,
  config,
  speechText,
  allowedModelOrigins,
}: RemoteAvatarProps) {
  const remoteModelUrl =
    appearance.modelUrl && isTrustedRemoteModelUrl(appearance.modelUrl, allowedModelOrigins) ? appearance.modelUrl : '';
  const modelUrl = characterUrl || remoteModelUrl;
  const handleModelError = useCallback((error: Error) => {
    logger.warn(`[RemotePlayer] model failed to load: ${modelUrl}`, error);
  }, [modelUrl]);
  if (!modelUrl) return null;

  // A peer-controlled model must not suspend or crash the shared world.
  return (
    <GaesupErrorBoundary key={modelUrl} fallback={REMOTE_MODEL_FALLBACK} onError={handleModelError}>
      <Suspense fallback={null}>
        <RemotePlayerContent
          motion={motion}
          appearance={appearance}
          config={config}
          speechText={speechText}
          modelUrl={modelUrl}
        />
      </Suspense>
    </GaesupErrorBoundary>
  );
});

export const RemotePlayer = React.memo(function RemotePlayer({
  state,
  characterUrl,
  config,
  speechText,
  allowedModelOrigins,
}: RemotePlayerProps) {
  const [motion] = useState(createRemoteMotion);
  // Each new state lands in the motion; the avatar below re-renders only when its appearance changes.
  syncRemoteMotion(motion, state, config?.tracking?.velocityThreshold ?? DEFAULT_REMOTE_VELOCITY_THRESHOLD);
  return (
    <RemoteAvatar
      motion={motion}
      appearance={motion.appearance}
      characterUrl={characterUrl}
      config={config}
      speechText={speechText}
      allowedModelOrigins={allowedModelOrigins}
    />
  );
});

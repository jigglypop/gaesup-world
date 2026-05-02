import React, { useRef, useEffect, useMemo, useCallback } from 'react';

import { useAnimations, useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { PhysicsEntity } from '@motions/entities/refs/PhysicsEntity';

import { NPCPartMeshProps, NPCInstanceProps } from './types';
import { applyToonToScene, getDefaultToonMode } from '../../../rendering/toon';
import { createNPCObservation, resolveNPCBrainDecision } from '../../core/brain';
import { useNPCStore } from '../../stores/npcStore';
import { NPCPart } from '../../types';
import './styles.css';

type PointerHandlers = {
  pointerover?: () => void;
  click?: () => void;
};
type GroupWithHandlers = THREE.Group & { __handlers?: PointerHandlers };

type NPCPartErrorBoundaryProps = NPCPartMeshProps & {
  children: React.ReactNode;
};

type NPCPartErrorBoundaryState = {
  hasError: boolean;
};

class NPCPartErrorBoundary extends React.Component<NPCPartErrorBoundaryProps, NPCPartErrorBoundaryState> {
  state: NPCPartErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): NPCPartErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: NPCPartErrorBoundaryProps) {
    if (this.state.hasError && prevProps.part.url !== this.props.part.url) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <NPCPartFallbackMesh part={this.props.part} instanceId={this.props.instanceId} />;
    }
    return this.props.children;
  }
}

function resolveAnimationKey(
  actions: Record<string, THREE.AnimationAction | null>,
  requested: string,
): string | undefined {
  if (actions[requested]) return requested;
  const keys = Object.keys(actions);
  const normalized = requested.toLowerCase();
  return keys.find((key) => key.toLowerCase() === normalized)
    ?? keys.find((key) => key.toLowerCase().includes(normalized))
    ?? (keys.length === 1 ? keys[0] : undefined);
}

function NPCPartFallbackMesh({ part }: NPCPartMeshProps) {
  return (
    <mesh
      position={part.position || [0, 0, 0]}
      rotation={part.rotation || [0, 0, 0]}
      scale={part.scale || [1, 1, 1]}
    >
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        color={part.color || '#cccccc'}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function resolveNPCAssetUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('gltf/')) return `/${trimmed}`;
  return trimmed;
}

function NPCPartGltfMesh({ part, currentAnimation }: NPCPartMeshProps) {
  const assetUrl = useMemo(() => resolveNPCAssetUrl(part.url), [part.url]);
  const gltf = useGLTF(assetUrl);
  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(gltf.scene);
    if (c && getDefaultToonMode()) applyToonToScene(c);
    return c;
  }, [gltf]);
  const { actions } = useAnimations(gltf.animations, clone);
  const activeAnimationRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!currentAnimation) return;
    const nextKey = resolveAnimationKey(actions, currentAnimation);
    if (!nextKey || activeAnimationRef.current === nextKey) return;

    const previous = activeAnimationRef.current ? actions[activeAnimationRef.current] : undefined;
    const next = actions[nextKey];
    previous?.fadeOut(0.2);
    next?.reset().fadeIn(0.2).play();
    activeAnimationRef.current = nextKey;
  }, [actions, currentAnimation]);

  if (!clone) return null;
  return (
    <primitive
      object={clone}
      position={part.position || [0, 0, 0]}
      rotation={part.rotation || [0, 0, 0]}
      scale={part.scale || [1, 1, 1]}
    />
  );
}

function NPCPartMesh({ part, instanceId, currentAnimation }: NPCPartMeshProps) {
  const hasUrl = !!part.url && part.url.trim() !== '';
  if (!hasUrl) return <NPCPartFallbackMesh part={part} instanceId={instanceId} />;
  return (
    <NPCPartErrorBoundary part={part} instanceId={instanceId} currentAnimation={currentAnimation}>
      <NPCPartGltfMesh part={part} instanceId={instanceId} currentAnimation={currentAnimation} />
    </NPCPartErrorBoundary>
  );
}

const ARRIVAL_THRESHOLD = 0.3;
const DEFAULT_NPC_VOLUME = {
  height: 1.8,
  radius: 0.32,
  interactionRadius: 1.6,
} as const;

export const NPCInstance = React.memo(function NPCInstance({ instance, isEditMode, onClick }: NPCInstanceProps) {
  const groupRef = useRef<GroupWithHandlers>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const waypointIndexRef = useRef(0);
  const template = useNPCStore(
    useCallback(
      (state) => state.templates.get(instance.templateId),
      [instance.templateId]
    )
  );
  const clothingSet = useNPCStore(
    useCallback(
      (state) =>
        instance.currentClothingSetId
          ? state.clothingSets.get(instance.currentClothingSetId)
          : undefined,
      [instance.currentClothingSetId]
    )
  );
  const advanceNavigation = useNPCStore((state) => state.advanceNavigation);
  const executeInstanceAction = useNPCStore((state) => state.executeInstanceAction);
  const executeInstanceActions = useNPCStore((state) => state.executeInstanceActions);
  const setInstanceDecision = useNPCStore((state) => state.setInstanceDecision);
  const setInstanceObservation = useNPCStore((state) => state.setInstanceObservation);
  const updateInstance = useNPCStore((state) => state.updateInstance);
  const updateNavigationPosition = useNPCStore(
    (state) => state.updateNavigationPosition
  );

  const isNavigating = instance.navigation?.state === 'moving';
  const volume = instance.volume ?? DEFAULT_NPC_VOLUME;
  const colliderHalfHeight = Math.max(0.05, volume.height * 0.5 - volume.radius);
  const colliderY = colliderHalfHeight + volume.radius;
  const bodyType = isNavigating ? 'kinematicPosition' : 'fixed';
  const interactionRadius = Math.max(volume.interactionRadius, volume.radius);
  const nextBehaviorAtRef = useRef(0);

  // Reset waypoint index when navigation changes.
  useEffect(() => {
    waypointIndexRef.current = instance.navigation?.currentIndex ?? 0;
  }, [instance.navigation?.waypoints]);

  // Navigation movement loop.
  useFrame((_, delta) => {
    if (!isNavigating || !instance.navigation) return;
    const body = rigidBodyRef.current;
    if (!body) return;

    const { waypoints, speed } = instance.navigation;
    const idx = waypointIndexRef.current;
    if (idx >= waypoints.length) return;

    const target = waypoints[idx];
    if (!target) return;
    const pos = body.translation();

    const dx = target[0] - pos.x;
    const dz = target[2] - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < ARRIVAL_THRESHOLD) {
      waypointIndexRef.current = idx + 1;
      if (idx + 1 >= waypoints.length) {
        updateNavigationPosition(instance.id, [target[0], target[1], target[2]]);
        advanceNavigation(instance.id);
      } else {
        advanceNavigation(instance.id);
      }
      return;
    }

    const step = Math.min(speed * delta, dist);
    const nx = pos.x + (dx / dist) * step;
    const nz = pos.z + (dz / dist) * step;

    body.setNextKinematicTranslation({ x: nx, y: pos.y, z: nz });

    // Face movement direction.
    if (groupRef.current && dist > 0.01) {
      const angle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = angle;
    }
  });

  useFrame((state) => {
    const brainMode = instance.brain?.mode ?? 'none';
    if (brainMode === 'none') return;
    if (state.clock.elapsedTime < nextBehaviorAtRef.current) return;

    const body = rigidBodyRef.current;
    const bodyPos = body?.translation();
    const observedInstance = bodyPos
      ? { ...instance, position: [bodyPos.x, bodyPos.y, bodyPos.z] as [number, number, number] }
      : instance;
    const observation = createNPCObservation(
      observedInstance,
      useNPCStore.getState().instances,
      state.clock.elapsedTime,
    );
    setInstanceObservation(instance.id, observation);

    const decision = resolveNPCBrainDecision(observedInstance, observation);
    if (decision && decision.actions.length > 0) {
      setInstanceDecision(instance.id, decision);
      executeInstanceActions(instance.id, decision.actions);
    }

    nextBehaviorAtRef.current = state.clock.elapsedTime + Math.max(0.5, instance.behavior?.waitSeconds ?? 1);
  });
  
  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    const handlers = groupRef.current?.__handlers;
    if (handlers?.pointerover) handlers.pointerover();
  }, []);
  
  const handlePointerLeave = useCallback(() => {
    document.body.style.cursor = 'default';
  }, []);

  const runEvent = useCallback((eventType: 'onClick' | 'onHover') => {
    const event = instance.events?.find((entry) => entry.type === eventType);
    if (!event) return;

    const payload = event.payload;
    if (event.action === 'dialogue' && payload?.type === 'dialogue') {
      executeInstanceAction(instance.id, {
        type: 'speak',
        text: payload.text,
        ...(payload.duration !== undefined ? { duration: payload.duration } : {}),
      });
      return;
    }
    if (event.action === 'animation' && payload?.type === 'animation') {
      executeInstanceAction(instance.id, {
        type: 'playAnimation',
        animationId: payload.animationId,
        ...(payload.loop !== undefined ? { loop: payload.loop } : {}),
      });
      return;
    }
    if (event.action === 'custom' && payload?.type === 'custom') {
      executeInstanceAction(instance.id, {
        type: 'remember',
        key: `event:${event.id}`,
        value: payload.data,
      });
      return;
    }
    if (event.action === 'sound' && payload?.type === 'sound') {
      updateInstance(instance.id, {
        metadata: {
          ...instance.metadata,
          lastInteractionTargetId: payload.soundUrl,
        },
      });
    }
  }, [executeInstanceAction, instance.events, instance.id, instance.metadata, updateInstance]);

  // 이벤트 핸들러 바인딩은 hook 이므로 early return 보다 위에서 호출되어야 React 의 hook 순서가 일관된다.
  useEffect(() => {
    if (!instance.events || instance.events.length === 0) return;
    const mesh = groupRef.current;
    if (!mesh) return;

    const handlePointerOver = () => {
      runEvent('onHover');
    };

    const handleClick = () => {
      runEvent('onClick');
    };

    mesh.__handlers = {
      pointerover: handlePointerOver,
      click: handleClick
    };
    return () => {
      delete mesh.__handlers;
    };
  }, [instance.events, runEvent]);

  // template / clothingSet / customParts 가 변하지 않는 한 같은 배열 reference 를 유지.
  const allParts = useMemo<NPCPart[]>(() => {
    if (!template) return [];
    const parts: NPCPart[] = [...template.baseParts];
    if (clothingSet) parts.push(...clothingSet.parts);
    if (template.accessoryParts) parts.push(...template.accessoryParts);
    if (instance.customParts) {
      for (const customPart of instance.customParts) {
        const idx = parts.findIndex(p => p.type === customPart.type);
        if (idx >= 0) parts[idx] = { ...parts[idx], ...customPart };
        else parts.push(customPart);
      }
    }
    return parts;
  }, [template, clothingSet, instance.customParts]);

  if (!template) {
    return null;
  }
  const fullModelUrl = template.fullModelUrl || instance.metadata?.modelUrl;

  if (fullModelUrl) {
    return (
      <PhysicsEntity
        ref={rigidBodyRef}
        url={fullModelUrl}
        isActive={false}
        componentType="character"
        name={`npc-${instance.id}`}
        position={instance.position}
        rotation={instance.rotation}
        rigidbodyType={bodyType}
        colliderSize={{ height: volume.height, radius: volume.radius }}
        currentAnimation={instance.currentAnimation || 'idle'}
        userData={{
          instanceId: instance.id,
          templateId: instance.templateId,
          nameTag: instance.metadata?.nameTag,
          npcBrainMode: instance.brain?.mode ?? 'none',
          npcPerceptionEnabled: instance.perception?.enabled ?? false,
        }}
        onCollisionEnter={() => {
          runEvent('onClick');
          if (onClick) onClick();
        }}
      >
        <CapsuleCollider
          sensor
          args={[Math.max(0.05, colliderHalfHeight), interactionRadius]}
          position={[0, colliderY, 0]}
        />
        {isEditMode && (
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
          </mesh>
        )}
      </PhysicsEntity>
    );
  }
  
  // mainPartUrl 분기 / fallback 분기는 본문이 동일하여 단일 경로로 합친다.
  return (
    <RigidBody
      ref={rigidBodyRef}
      type={bodyType}
      position={instance.position}
      rotation={instance.rotation}
      colliders={false}
      userData={{
        instanceId: instance.id,
        templateId: instance.templateId,
        npcBrainMode: instance.brain?.mode ?? 'none',
        npcPerceptionEnabled: instance.perception?.enabled ?? false,
      }}
    >
      <CapsuleCollider args={[colliderHalfHeight, volume.radius]} position={[0, colliderY, 0]} />
      <CapsuleCollider
        sensor
        args={[Math.max(0.05, colliderHalfHeight), interactionRadius]}
        position={[0, colliderY, 0]}
      />
      <group
        ref={groupRef}
        scale={instance.scale}
        {...(onClick
          ? {
              onClick: (e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                e.nativeEvent.preventDefault();
                runEvent('onClick');
                onClick();
              },
            }
          : {})}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {allParts.map((part) => (
          <NPCPartMesh
            key={part.id}
            part={part}
            instanceId={instance.id}
            currentAnimation={instance.currentAnimation ?? instance.behavior?.idleAnimation ?? 'idle'}
          />
        ))}

        {isEditMode && (
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
}); 

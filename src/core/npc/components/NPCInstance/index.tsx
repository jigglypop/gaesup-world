import React, { Suspense, useRef, useEffect, useMemo, useCallback } from 'react';

import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { PhysicsEntity } from '@motions/entities/refs/PhysicsEntity';

import { NPCPresence } from './NPCPresence';
import { NPCPartMeshProps, NPCInstanceProps } from './types';
import { useSharedAnimations } from '../../../animation/hooks/useSharedAnimations';
import { CompileGate } from '../../../rendering/CompileGate';
import { useSceneToon } from '../../../rendering/useSceneToon';
import { useWorldPhysicsInterpolation } from '../../../simulation/physicsContext';
import { useNPCSimulation } from '../../hooks/useNPCSimulation';
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
  override state: NPCPartErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): NPCPartErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidUpdate(prevProps: NPCPartErrorBoundaryProps) {
    if (this.state.hasError && prevProps.part.url !== this.props.part.url) {
      this.setState({ hasError: false });
    }
  }

  override render() {
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

function NPCPartGltfMesh({ part, currentAnimation, cullRadius }: NPCPartMeshProps) {
  const assetUrl = useMemo(() => resolveNPCAssetUrl(part.url), [part.url]);
  const gltf = useGLTF(assetUrl);
  const clone = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf]);
  useSceneToon(clone);
  const { actions } = useSharedAnimations(gltf.animations, clone, cullRadius);
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

/**
 * A model that is still loading suspends only itself, and it shows once its pipelines are built instead of stalling
 * the frame that first draws it.
 */
function NPCModelGate({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}><CompileGate>{children}</CompileGate></Suspense>;
}

function NPCPartMesh({ part, instanceId, currentAnimation, cullRadius }: NPCPartMeshProps) {
  const hasUrl = !!part.url && part.url.trim() !== '';
  if (!hasUrl) return <NPCPartFallbackMesh part={part} instanceId={instanceId} />;
  return (
    <NPCPartErrorBoundary part={part} instanceId={instanceId} currentAnimation={currentAnimation}>
      <NPCModelGate>
        <NPCPartGltfMesh part={part} instanceId={instanceId} currentAnimation={currentAnimation} cullRadius={cullRadius} />
      </NPCModelGate>
    </NPCPartErrorBoundary>
  );
}

const DEFAULT_NPC_VOLUME = {
  height: 1.8,
  radius: 0.32,
  interactionRadius: 1.6,
} as const;
/** The body capsule of a volume drawn at `scale`; the talk range stays in world meters. */
function npcCapsule(volume: { height: number; radius: number; interactionRadius: number }, scale: readonly [number, number, number]) {
  const radius = volume.radius * Math.max(scale[0], scale[2]);
  const halfHeight = Math.max(0.05, volume.height * scale[1] * 0.5 - radius);
  return { radius, height: volume.height * scale[1], halfHeight, y: halfHeight + radius, interactionRadius: Math.max(volume.interactionRadius, radius) };
}

export const NPCInstance = React.memo(function NPCInstance({ instance, isEditMode, onClick: onClickProp, onSelect }: NPCInstanceProps) {
  const simulation = useNPCSimulation();
  const onClick = useMemo(
    () => (onSelect ? () => { onClickProp?.(); onSelect(instance.id); } : onClickProp),
    [instance.id, onClickProp, onSelect],
  );
  const groupRef = useRef<GroupWithHandlers>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const detachBody = useRef<(() => void) | undefined>(undefined);
  const bindBody = useCallback((body: RapierRigidBody | null) => {
    detachBody.current?.();
    rigidBodyRef.current = body;
    detachBody.current = body ? simulation.bindBody(instance.id, body) : undefined;
  }, [simulation, instance.id]);
  const pose = simulation.getPose(instance.id);
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
  const executeInstanceAction = useNPCStore((state) => state.executeInstanceAction);
  const updateInstance = useNPCStore((state) => state.updateInstance);

  const volume = instance.volume ?? DEFAULT_NPC_VOLUME;
  const bodyType = 'kinematicPosition';

  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    const handlers = groupRef.current?.__handlers;
    if (handlers?.pointerover) handlers.pointerover();
  }, []);
  
  const handlePointerLeave = useCallback(() => {
    document.body.style.cursor = 'default';
  }, []);

  const runEvent = useCallback((eventType: 'onClick' | 'onHover' | 'onInteract') => {
    const event = instance.events?.find((entry) => entry.type === eventType);
    if (!event) return;

    const payload = event.payload;
    if (event.action === 'dialogue' && payload?.type === 'dialogue') {
      simulation.speak(instance.id, payload.text, payload.duration);
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
  }, [executeInstanceAction, instance.events, instance.id, instance.metadata, simulation, updateInstance]);

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
    const capsule = npcCapsule(volume, instance.scale);
    return (
      <NPCModelGate>
      <PhysicsEntity
        ref={bindBody}
        url={fullModelUrl}
        isActive={false}
        componentType="character"
        name={`npc-${instance.id}`}
        position={pose?.position ?? instance.position}
        rotation={pose?.rotation ?? instance.rotation}
        scale={instance.scale}
        rigidbodyType={bodyType}
        colliderSize={{ height: capsule.height, radius: capsule.radius }}
        animationCullRadius={capsule.height}
        currentAnimation={instance.currentAnimation || 'idle'}
        userData={{
          instanceId: instance.id,
          templateId: instance.templateId,
          nameTag: instance.metadata?.nameTag,
          npcBrainMode: instance.brain?.mode ?? 'none',
          npcPerceptionEnabled: instance.perception?.enabled ?? false,
        }}
        colliderChildren={<CapsuleCollider sensor args={[capsule.halfHeight, capsule.interactionRadius]} position={[0, capsule.y, 0]} />}
        onCollisionEnter={() => {
          runEvent('onClick');
          if (onClick) onClick();
        }}
      >
        {isEditMode && (
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
          </mesh>
        )}
        <NPCPresence instance={instance} height={capsule.height} onInteract={() => runEvent('onInteract')} />
      </PhysicsEntity>
      </NPCModelGate>
    );
  }
  
  // mainPartUrl 분기 / fallback 분기는 본문이 동일하여 단일 경로로 합친다.
  const capsule = npcCapsule(volume, instance.scale);
  return (
    <RigidBody
      ref={bindBody}
      type={bodyType}
      position={pose?.position ?? instance.position}
      rotation={pose?.rotation ?? instance.rotation}
      colliders={false}
      userData={{
        instanceId: instance.id,
        templateId: instance.templateId,
        npcBrainMode: instance.brain?.mode ?? 'none',
        npcPerceptionEnabled: instance.perception?.enabled ?? false,
      }}
    >
      <CapsuleCollider args={[capsule.halfHeight, capsule.radius]} position={[0, capsule.y, 0]} />
      <CapsuleCollider
        sensor
        args={[capsule.halfHeight, capsule.interactionRadius]}
        position={[0, capsule.y, 0]}
      />
      <NPCVisual bodyRef={rigidBodyRef}><group
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
            cullRadius={capsule.height}
          />
        ))}

        {isEditMode && (
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
          </mesh>
        )}
      </group>
      <NPCPresence instance={instance} height={capsule.height} onInteract={() => runEvent('onInteract')} />
      </NPCVisual>
    </RigidBody>
  );
});

/** Characters never block the camera or other ray probes, matching `PhysicsEntity`. */
const INTANGIBLE = { intangible: true };

function NPCVisual({ bodyRef, children }: { bodyRef: React.RefObject<RapierRigidBody | null>; children: React.ReactNode }) {
  const visual = useWorldPhysicsInterpolation(bodyRef);
  return <group ref={visual} userData={INTANGIBLE}>{children}</group>;
}

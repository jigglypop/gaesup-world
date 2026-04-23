import React, { useRef, useEffect, useMemo, useCallback } from 'react';

import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { PhysicsEntity } from '@motions/entities/refs/PhysicsEntity';

import { NPCPartMeshProps, NPCInstanceProps } from './types';
import { applyToonToScene, getDefaultToonMode } from '../../../rendering/toon';
import { useNPCStore } from '../../stores/npcStore';
import { NPCPart } from '../../types';
import './styles.css';

type PointerHandlers = {
  pointerover?: () => void;
  click?: () => void;
};
type GroupWithHandlers = THREE.Group & { __handlers?: PointerHandlers };

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

function NPCPartGltfMesh({ part }: NPCPartMeshProps) {
  const gltf = useGLTF(part.url);
  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(gltf.scene);
    if (c && getDefaultToonMode()) applyToonToScene(c);
    return c;
  }, [gltf]);
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

function NPCPartMesh({ part, instanceId }: NPCPartMeshProps) {
  void instanceId;
  const hasUrl = !!part.url && part.url.trim() !== '';
  if (!hasUrl) return <NPCPartFallbackMesh part={part} instanceId={instanceId} />;
  return <NPCPartGltfMesh part={part} instanceId={instanceId} />;
}

const ARRIVAL_THRESHOLD = 0.3;

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
  const updateNavigationPosition = useNPCStore(
    (state) => state.updateNavigationPosition
  );

  const isNavigating = instance.navigation?.state === 'moving';

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
  
  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    const handlers = groupRef.current?.__handlers;
    if (handlers?.pointerover) handlers.pointerover();
  }, []);
  
  const handlePointerLeave = useCallback(() => {
    document.body.style.cursor = 'default';
  }, []);

  // 이벤트 핸들러 바인딩은 hook 이므로 early return 보다 위에서 호출되어야 React 의 hook 순서가 일관된다.
  useEffect(() => {
    if (!instance.events || instance.events.length === 0) return;
    const mesh = groupRef.current;
    if (!mesh) return;

    const handlePointerOver = () => {
      void instance.events?.find(e => e.type === 'onHover');
    };

    const handleClick = () => {
      const clickEvent = instance.events?.find(e => e.type === 'onClick');
      if (clickEvent) {
        switch (clickEvent.action) {
          case 'dialogue':
          case 'animation':
          case 'sound':
          case 'custom':
            break;
        }
      }
    };

    mesh.__handlers = {
      pointerover: handlePointerOver,
      click: handleClick
    };
    return () => {
      delete mesh.__handlers;
    };
  }, [instance.events]);

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
        currentAnimation={instance.currentAnimation || 'idle'}
        userData={{
          instanceId: instance.id,
          templateId: instance.templateId,
          nameTag: instance.metadata?.nameTag
        }}
        onCollisionEnter={() => {
          if (onClick) onClick();
        }}
      >
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
  const bodyType = isNavigating ? 'kinematicPosition' : 'fixed';

  return (
    <RigidBody
      ref={rigidBodyRef}
      type={bodyType}
      position={instance.position}
      rotation={instance.rotation}
      colliders="cuboid"
    >
      <group
        ref={groupRef}
        scale={instance.scale}
        {...(onClick
          ? {
              onClick: (e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                onClick();
              },
            }
          : {})}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {allParts.map((part) => (
          <NPCPartMesh key={part.id} part={part} instanceId={instance.id} />
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

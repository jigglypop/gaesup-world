import React, { useRef, useEffect, useMemo, useCallback } from 'react';

import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { PhysicsEntity } from '@motions/entities/refs/PhysicsEntity';

import { NPCPartMeshProps, NPCInstanceProps } from './types';
import { useNPCStore } from '../../stores/npcStore';
import { NPCPart } from '../../types';
import './styles.css';

type PointerHandlers = {
  pointerover?: () => void;
  click?: () => void;
};
type GroupWithHandlers = THREE.Group & { __handlers?: PointerHandlers };

function NPCPartMesh({ part, instanceId }: NPCPartMeshProps) {
  void instanceId;
  const hasUrl = part.url && part.url.trim() !== '';
  const gltf = hasUrl ? useGLTF(part.url) : null;
  const clone = useMemo(() => gltf ? SkeletonUtils.clone(gltf.scene) : null, [gltf]);
  if (!hasUrl) {
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

const ARRIVAL_THRESHOLD = 0.3;

export const NPCInstance = React.memo(function NPCInstance({ instance, isEditMode, onClick }: NPCInstanceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const waypointIndexRef = useRef(0);
  const { templates, clothingSets } = useNPCStore();
  const template = templates.get(instance.templateId);

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
    const pos = body.translation();

    const dx = target[0] - pos.x;
    const dz = target[2] - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < ARRIVAL_THRESHOLD) {
      waypointIndexRef.current = idx + 1;
      const store = useNPCStore.getState();
      if (idx + 1 >= waypoints.length) {
        store.updateNavigationPosition(instance.id, [target[0], target[1], target[2]]);
        store.advanceNavigation(instance.id);
      } else {
        store.advanceNavigation(instance.id);
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
  
  const handlePointerEnter = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    const handlers = (groupRef.current as unknown as GroupWithHandlers | null)?.__handlers;
    if (handlers?.pointerover) handlers.pointerover();
  }, []);
  
  const handlePointerLeave = useCallback(() => {
    document.body.style.cursor = 'default';
  }, []);
  
  if (!template) {
    return null;
  }
  const allParts: NPCPart[] = [];
  allParts.push(...template.baseParts);
  if (instance.currentClothingSetId) {
    const clothingSet = clothingSets.get(instance.currentClothingSetId);
    if (clothingSet) {
      allParts.push(...clothingSet.parts);
    }
  }
  if (template.accessoryParts) {
    allParts.push(...template.accessoryParts);
  }
  if (instance.customParts) {
    instance.customParts.forEach(customPart => {
      const index = allParts.findIndex(p => p.type === customPart.type);
      if (index >= 0) {
        allParts[index] = { ...allParts[index], ...customPart };
      } else {
        allParts.push(customPart);
      }
    });
  }
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
            break;
          case 'animation':
            break;
          case 'sound':
            break;
          case 'custom':
            break;
        }
      }
    };
    
    const meshElement = mesh as unknown as GroupWithHandlers;
    meshElement.__handlers = {
      pointerover: handlePointerOver,
      click: handleClick
    };
    return () => {
      delete meshElement.__handlers;
    };
  }, [instance.events]);
  const fullModelUrl = template.fullModelUrl || instance.metadata?.modelUrl;
  
  if (fullModelUrl) {
    return (
      <PhysicsEntity
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
  
  // 개별 파트들로 구성된 NPC (애니메이션 미지원)
  const mainPartUrl = allParts.find(part => part.url && part.type === 'body')?.url || 
                      allParts.find(part => part.url)?.url;
  
  const bodyType = isNavigating ? 'kinematicPosition' : 'fixed';

  if (mainPartUrl) {
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
  }
  
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
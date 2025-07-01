import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { extend } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { PhysicsEntity } from '@motions/entities';
import { useNPCStore } from '../../stores/npcStore';
import { NPCPart } from '../../types';
import './styles.css';
import { NPCPartMeshProps, NPCInstanceProps } from './types';

extend(THREE);
function NPCPartMesh({ part, instanceId }: NPCPartMeshProps) {
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
  return (
    <primitive 
      object={clone}
      position={part.position || [0, 0, 0]}
      rotation={part.rotation || [0, 0, 0]}
      scale={part.scale || [1, 1, 1]}
    />
  );
}

export function NPCInstance({ instance, isEditMode, onClick }: NPCInstanceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { templates, clothingSets } = useNPCStore();
  const template = templates.get(instance.templateId);
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
      const hoverEvent = instance.events?.find(e => e.type === 'onHover');
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
    
    const meshElement = mesh as any;
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
        componentType={"character" as any}
        name={`npc-${instance.id}`}
        position={instance.position}
        rotation={instance.rotation}
        currentAnimation={instance.currentAnimation || 'idle'}
        userData={{
          instanceId: instance.id,
          templateId: instance.templateId,
          nameTag: instance.metadata?.nameTag
        }}
        onCollisionEnter={(payload) => {
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
  
  if (mainPartUrl) {
    return (
      <RigidBody
        type="fixed"
        position={instance.position}
        rotation={instance.rotation}
        colliders="cuboid"
      >
        <group
          ref={groupRef}
          scale={instance.scale}
          onClick={onClick}
          onPointerEnter={(e: any) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
            const handlers = (groupRef.current as any)?.__handlers;
            if (handlers?.pointerover) handlers.pointerover();
          }}
          onPointerLeave={() => {
            document.body.style.cursor = 'default';
          }}
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
      type="fixed"
      position={instance.position}
      rotation={instance.rotation}
      colliders="cuboid"
    >
      <group
        ref={groupRef}
        scale={instance.scale}
        onClick={onClick}
        onPointerEnter={(e: any) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          const handlers = (groupRef.current as any)?.__handlers;
          if (handlers?.pointerover) handlers.pointerover();
        }}
        onPointerLeave={() => {
          document.body.style.cursor = 'default';
        }}
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
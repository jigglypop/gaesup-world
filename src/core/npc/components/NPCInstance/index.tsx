import React, { useRef, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import { PassiveCharacter } from 'gaesup-world';
import { useNPCStore } from '../../stores/npcStore';
import { NPCInstance as NPCInstanceType, NPCPart } from '../../types';
import './styles.css';
import { PassiveObjects } from '@/core/world';

interface NPCInstanceProps {
  instance: NPCInstanceType;
  isEditMode?: boolean;
  onClick?: () => void;
}

interface NPCPartMeshProps {
  part: NPCPart;
  instanceId: string;
}

function NPCPartMesh({ part, instanceId }: NPCPartMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  try {
    const gltf = useLoader(GLTFLoader, part.url);
    
    useEffect(() => {
      if (meshRef.current && part.color) {
        meshRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const material = child.material as THREE.MeshStandardMaterial;
            if (material) {
              material.color = new THREE.Color(part.color);
            }
          }
        });
      }
    }, [part.color]);
    
    return (
      <primitive
        ref={meshRef}
        object={gltf.scene.clone()}
        position={part.position || [0, 0, 0]}
        rotation={part.rotation || [0, 0, 0]}
        scale={part.scale || [1, 1, 1]}
      />
    );
  } catch (error) {
    console.warn(`Failed to load part ${part.id}:`, error);
    return null;
  }
}

export function NPCInstance({ instance, isEditMode, onClick }: NPCInstanceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { templates, clothingSets } = useNPCStore();
  const template = templates.get(instance.templateId);
  
  if (!template) {
    console.warn(`Template ${instance.templateId} not found`);
    return null;
  }
  
  // Get all parts to render
  const allParts: NPCPart[] = [];
  
  // Add base parts (body, hair)
  allParts.push(...template.baseParts);
  
  // Add clothing parts if a clothing set is selected
  if (instance.currentClothingSetId) {
    const clothingSet = clothingSets.get(instance.currentClothingSetId);
    if (clothingSet) {
      allParts.push(...clothingSet.parts);
    }
  }
  
  // Add accessory parts
  if (template.accessoryParts) {
    allParts.push(...template.accessoryParts);
  }
  
  // Override with custom parts if any
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
        console.log('Click event:', clickEvent);
        // Handle click event based on action type
        switch (clickEvent.action) {
          case 'dialogue':
            // Show dialogue
            break;
          case 'animation':
            // Play animation
            break;
          case 'sound':
            // Play sound
            break;
          case 'custom':
            // Execute custom action
            break;
        }
      }
    };
    
    mesh.addEventListener('pointerover', handlePointerOver);
    mesh.addEventListener('click', handleClick);
    
    return () => {
      mesh.removeEventListener('pointerover', handlePointerOver);
      mesh.removeEventListener('click', handleClick);
    };
  }, [instance.events]);
  
  // Find the main body part (usually the first one)
  const mainPart = allParts.find(part => part.type === 'body') || allParts[0];
  
  if (!mainPart || !mainPart.url) {
    // Fallback to box if no valid part
    return (
      <group
        position={instance.position}
        rotation={instance.rotation}
        scale={instance.scale}
      >
        <RigidBody type="fixed" colliders="cuboid">
          <mesh onClick={onClick}>
            <boxGeometry args={[0.5, 1.8, 0.5]} />
            <meshStandardMaterial color="royalblue" />
          </mesh>
        </RigidBody>
        
        {isEditMode && (
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
          </mesh>
        )}
      </group>
    );
  }
  
  // Convert parts for PassiveCharacter
  const passiveParts = allParts
    .slice(1)
    .map(part => part.url ? { url: part.url } : null)
    .filter(part => part !== null);
  
  return (
    <group
      ref={groupRef}
      position={instance.position}
      rotation={instance.rotation}
      scale={instance.scale}
      onClick={onClick}
    >
      <PassiveObjects
        rigidbodyType="fixed"
        currentAnimation={instance.animation || "idle"}
        url={mainPart.url}
        parts={passiveParts}
      />
      
      {isEditMode && (
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
} 
import React, { useRef, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { useNPCStore } from '../../stores/npcStore';
import { NPCInstance, NPCPart } from '../../types';
import './styles.css';

interface NPCInstanceProps {
  instance: NPCInstance;
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
  const { templates } = useNPCStore();
  const template = templates.get(instance.templateId);
  
  if (!template) {
    console.warn(`Template ${instance.templateId} not found`);
    return null;
  }
  
  // Merge template parts with custom parts
  const parts = template.parts.map(templatePart => {
    const customPart = instance.customParts?.find(p => p.id === templatePart.id);
    return customPart ? { ...templatePart, ...customPart } : templatePart;
  });
  
  return (
    <group
      ref={groupRef}
      position={instance.position}
      rotation={instance.rotation}
      scale={instance.scale}
      onClick={onClick}
    >
      {parts.map((part) => (
        <NPCPartMesh key={part.id} part={part} instanceId={instance.id} />
      ))}
      
      {isEditMode && (
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
} 
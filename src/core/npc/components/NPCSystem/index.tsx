import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useNPCStore } from '../../stores/npcStore';
import { NPCInstance } from '../NPCInstance';
import './styles.css';

export function NPCSystem() {
  const { raycaster, camera, gl } = useThree();
  const {
    instances,
    editMode,
    selectedTemplateId,
    createInstanceFromTemplate,
    removeInstance,
    setSelectedInstance
  } = useNPCStore();

  useEffect(() => {
    if (!editMode || !selectedTemplateId) return;

    const handleClick = (event: MouseEvent) => {
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      
      raycaster.setFromCamera(mouse, camera);
      
      // Check if clicking on ground
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      
      if (raycaster.ray.intersectPlane(groundPlane, intersection)) {
        createInstanceFromTemplate(selectedTemplateId, [
          intersection.x,
          0,
          intersection.z
        ]);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [editMode, selectedTemplateId, raycaster, camera, gl, createInstanceFromTemplate]);

  return (
    <group name="npc-system">
      {Array.from(instances.values()).map((instance) => (
        <NPCInstance
          key={instance.id}
          instance={instance}
          isEditMode={editMode}
          onClick={() => {
            if (editMode) {
              setSelectedInstance(instance.id);
            }
          }}
        />
      ))}
    </group>
  );
} 
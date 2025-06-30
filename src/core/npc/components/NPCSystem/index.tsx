import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useNPCStore } from '../../stores/npcStore';
import { useBuildingStore } from '../../../building/stores/buildingStore';
import { NPCInstance } from '../NPCInstance';
import './styles.css';

export function NPCSystem() {
  const { raycaster, camera, gl } = useThree();
  const {
    instances,
    selectedTemplateId,
    createInstanceFromTemplate,
    removeInstance,
    setSelectedInstance
  } = useNPCStore();
  
  const editMode = useBuildingStore(state => state.editMode);
  const hoverPosition = useBuildingStore(state => state.hoverPosition);
  const isNPCMode = editMode === 'npc';

  useEffect(() => {
    if (!isNPCMode || !selectedTemplateId || !hoverPosition) return;

    const handleClick = (event: MouseEvent) => {
      if (hoverPosition) {
        createInstanceFromTemplate(selectedTemplateId, [
          hoverPosition.x,
          hoverPosition.y,
          hoverPosition.z
        ]);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [isNPCMode, selectedTemplateId, hoverPosition, gl, createInstanceFromTemplate]);

  return (
    <group name="npc-system">
      {Array.from(instances.values()).map((instance) => (
        <NPCInstance
          key={instance.id}
          instance={instance}
          isEditMode={isNPCMode}
          onClick={() => {
            if (isNPCMode) {
              setSelectedInstance(instance.id);
            }
          }}
        />
      ))}
    </group>
  );
} 
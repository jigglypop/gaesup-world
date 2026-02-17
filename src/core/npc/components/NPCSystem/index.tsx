import { useEffect, useRef, useState } from 'react';

import { useFrame, useThree } from '@react-three/fiber';

import { weightFromDistance } from '@core/utils/sfe';

import { useBuildingStore } from '../../../building/stores/buildingStore';
import { useNPCStore } from '../../stores/npcStore';
import { NPCInstance } from '../NPCInstance';
import './styles.css';

const NPC_LOD_NEAR = 30;
const NPC_LOD_FAR = 120;
const NPC_LOD_STRENGTH = 4;

export function NPCSystem() {
  const { gl } = useThree();
  const {
    instances,
    selectedTemplateId,
    createInstanceFromTemplate,
    setSelectedInstance
  } = useNPCStore();
  const editMode = useBuildingStore(state => state.editMode);
  const hoverPosition = useBuildingStore(state => state.hoverPosition);
  const isNPCMode = editMode === 'npc';

  // Distance-based LOD: hide NPCs beyond LOD_FAR.
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set());
  const lodAccum = useRef(0);

  useFrame((state, delta) => {
    lodAccum.current += delta;
    if (lodAccum.current < 0.5) return; // Check every 0.5s.
    lodAccum.current = 0;

    const cam = state.camera.position;
    const next = new Set<string>();
    instances.forEach((inst) => {
      const [x, y, z] = inst.position;
      const dx = x - cam.x, dy = y - cam.y, dz = z - cam.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const w = weightFromDistance(dist, NPC_LOD_NEAR, NPC_LOD_FAR, NPC_LOD_STRENGTH);
      if (w > 0.01) next.add(inst.id);
    });

    // Only update state if the set actually changed.
    if (next.size !== visibleIds.size || [...next].some(id => !visibleIds.has(id))) {
      setVisibleIds(next);
    }
  });

  useEffect(() => {
    if (!isNPCMode || !selectedTemplateId || !hoverPosition) return;
    const handleClick = () => {
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
      {Array.from(instances.values()).map((instance) => {
        // In edit mode show all; otherwise respect LOD.
        if (!isNPCMode && !visibleIds.has(instance.id)) return null;
        return (
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
        );
      })}
    </group>
  );
} 
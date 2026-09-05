import { NPCPartPreviewProps } from './types';
import { useBuildingStore } from '../../../building/stores/buildingStore';
import { useNPCStore } from '../../stores/npcStore';
import { NPCPart } from '../../types';
import './styles.css';

function NPCPartPreview({ part }: NPCPartPreviewProps) {
  return (
    <mesh
      position={part.position || [0, 0, 0]}
      rotation={part.rotation || [0, 0, 0]}
      scale={part.scale || [1, 1, 1]}
    >
      <boxGeometry args={[0.5, 1.8, 0.5]} />
      <meshStandardMaterial 
        color="royalblue"
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

export function NPCPreview() {
  const editMode = useBuildingStore((state) => state.editMode);
  const hoverPosition = useBuildingStore((state) => state.hoverPosition);
  const templates = useNPCStore((state) => state.templates);
  const clothingSets = useNPCStore((state) => state.clothingSets);
  const selectedTemplateId = useNPCStore((state) => state.selectedTemplateId);
  const selectedClothingSetId = useNPCStore(
    (state) => state.selectedClothingSetId
  );
  const previewAccessories = useNPCStore((state) => state.previewAccessories);
  
  if (editMode !== 'npc' || !hoverPosition) {
    return null;
  }

  const allParts: NPCPart[] = [];
  if (selectedTemplateId) {
    const template = templates.get(selectedTemplateId);
    if (template) {
      allParts.push(...template.baseParts);

      if (selectedClothingSetId) {
        const clothingSet = clothingSets.get(selectedClothingSetId);
        if (clothingSet) {
          allParts.push(...clothingSet.parts);
        }
      }

      if (previewAccessories.hat) {
        const hatSet = clothingSets.get(previewAccessories.hat);
        if (hatSet && hatSet.parts.length > 0) {
          const part = hatSet.parts[0];
          if (part) allParts.push(part);
        }
      }

      if (previewAccessories.glasses) {
        const glassesSet = clothingSets.get(previewAccessories.glasses);
        if (glassesSet && glassesSet.parts.length > 0) {
          const part = glassesSet.parts[0];
          if (part) allParts.push(part);
        }
      }
    }
  }
  
  return (
    <group position={[hoverPosition.x, hoverPosition.y, hoverPosition.z]}>
      {allParts.map((part) => (
        <NPCPartPreview key={part.id} part={part} />
      ))}
      
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial
          color="#00ff00"
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" depthWrite={false} />
      </mesh>
    </group>
  );
} 
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
  const { templates, clothingSets, selectedTemplateId, selectedClothingSetId, previewAccessories } = useNPCStore();
  
  if (editMode !== 'npc' || !hoverPosition || !selectedTemplateId) {
    return null;
  }
  
  const template = templates.get(selectedTemplateId);
  if (!template) {
    return null;
  }
  
  const allParts: NPCPart[] = [];
  
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
      allParts.push(hatSet.parts[0]);
    }
  }
  
  if (previewAccessories.glasses) {
    const glassesSet = clothingSets.get(previewAccessories.glasses);
    if (glassesSet && glassesSet.parts.length > 0) {
      allParts.push(glassesSet.parts[0]);
    }
  }
  
  return (
    <group position={[hoverPosition.x, hoverPosition.y, hoverPosition.z]}>
      {allParts.map((part) => (
        <NPCPartPreview key={part.id} part={part} />
      ))}
      
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial
          color="#00ff00"
          transparent
          opacity={0.3}
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
} 
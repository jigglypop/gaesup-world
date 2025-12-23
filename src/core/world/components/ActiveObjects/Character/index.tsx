import { useEffect } from 'react';

import { useGenericRefs } from '@hooks/useGenericRefs';
import { PhysicsEntity } from '@motions/entities/refs/PhysicsEntity';

import { ObjectComponentProps } from '../types';

export function Character({ 
  object, 
  selected = false, 
  onSelect, 
  showDebugInfo = false 
}: ObjectComponentProps) {
  const refs = useGenericRefs();

  useEffect(() => {
    if (refs.rigidBodyRef && refs.rigidBodyRef.current) {
      refs.rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }, [refs.rigidBodyRef]);

  const characterUrl = object.metadata?.['characterUrl'];
  if (typeof characterUrl !== 'string' || characterUrl.length === 0) return null;

  const currentAnimationValue = object.metadata?.['currentAnimation'];
  const currentAnimation = typeof currentAnimationValue === 'string' ? currentAnimationValue : 'idle';

  const nameTagValue = object.metadata?.['nameTag'];
  const nameTag = typeof nameTagValue === 'string' ? nameTagValue : undefined;
  
  return (
    <PhysicsEntity
      url={characterUrl}
      isActive={false}
      componentType="character"
      name={`active-character-${object.id}`}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      currentAnimation={currentAnimation}
      ref={refs.rigidBodyRef}
      outerGroupRef={refs.outerGroupRef}
      innerGroupRef={refs.innerGroupRef}
      colliderRef={refs.colliderRef}
      userData={{
        id: object.id,
        type: 'active',
        subType: 'character',
        health: object.health,
        maxHealth: object.maxHealth,
        energy: object.energy,
        maxEnergy: object.maxEnergy,
        nameTag,
      }}
      onCollisionEnter={() => {
        if (onSelect) {
          onSelect(object.id);
        }
      }}
    >
      {selected && showDebugInfo && (
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#ff0000" transparent opacity={0.6} />
        </mesh>
      )}
    </PhysicsEntity>
  );
}

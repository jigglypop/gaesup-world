import { useEffect } from 'react';
import { PhysicsEntity, useGenericRefs } from '@motions/entities';
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
  
  // 모델 URL이 없으면 렌더링하지 않음
  if (!object.metadata?.characterUrl) {
    return null;
  }
  
  return (
    <PhysicsEntity
      url={object.metadata.characterUrl}
      isActive={false}
      componentType="character"
      name={`active-character-${object.id}`}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      currentAnimation={object.metadata?.currentAnimation || 'idle'}
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
        nameTag: object.metadata?.nameTag
      }}
      onCollisionEnter={(payload) => {
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

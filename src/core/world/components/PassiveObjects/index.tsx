import { memo, useCallback, useMemo } from 'react';

import { CapsuleCollider, RigidBody } from '@react-three/rapier';

import { useGenericRefs } from '@hooks/useGenericRefs';
import { PhysicsEntity } from '@motions/entities/refs/PhysicsEntity';

import { PassiveObjectInstanceProps, PassiveObjectProps } from './types';

import './styles.css';

const PassiveObjectInstance = memo(function PassiveObjectInstance({
  object,
  isSelected,
  onSelect,
  showDebugInfo = false,
  enableInteraction = true
}: PassiveObjectInstanceProps) {
  const refs = useGenericRefs();
  
  const handleClick = useCallback(() => {
    if (enableInteraction && object.interactable && onSelect) {
      onSelect(object.id);
    }
  }, [enableInteraction, object.interactable, object.id, onSelect]);
  
  const handlePointerEnter = useCallback((e: React.PointerEvent) => {
    if (enableInteraction && object.interactable) {
      e.stopPropagation();
      document.body.style.cursor = 'pointer';
    }
  }, [enableInteraction, object.interactable]);
  
  const handlePointerLeave = useCallback(() => {
    document.body.style.cursor = 'default';
  }, []);
  
  if (object.metadata?.modelUrl) {
    return (
      <PhysicsEntity
        url={object.metadata.modelUrl}
        isActive={false}
        componentType={object.type}
        name={`passive-${object.type}-${object.id}`}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        ref={refs.rigidBodyRef}
        outerGroupRef={refs.outerGroupRef}
        innerGroupRef={refs.innerGroupRef}
        colliderRef={refs.colliderRef}
        userData={{
          id: object.id,
          type: 'passive',
          subType: object.type,
          interactable: object.interactable,
          onNear: object.metadata?.onNear,
          onLeave: object.metadata?.onLeave,
          onInteract: object.metadata?.onInteract
        }}
        onCollisionEnter={() => {
          if (enableInteraction && object.interactable && onSelect) {
            onSelect(object.id);
          }
        }}
      >
        {isSelected && showDebugInfo && (
          <mesh position={[0, 3, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
          </mesh>
        )}
      </PhysicsEntity>
    );
  }
  
  return (
    <RigidBody
      type="fixed"
      position={object.position}
      rotation={object.rotation}
      colliders={false}
    >
      <CapsuleCollider args={[1, 0.5]} position={[0, 1, 0]} />
      <group
        scale={object.scale}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
      </group>
    </RigidBody>
  );
});

export function PassiveObjects({ 
  objects, 
  selectedId, 
  onSelect, 
  showDebugInfo = false,
  enableInteraction = true
}: PassiveObjectProps) {
  const objectElements = useMemo(() => 
    objects.map((obj) => (
      <PassiveObjectInstance
        key={obj.id}
        object={obj}
        isSelected={obj.id === selectedId}
        onSelect={onSelect}
        showDebugInfo={showDebugInfo}
        enableInteraction={enableInteraction}
      />
    )), 
    [objects, selectedId, onSelect, showDebugInfo, enableInteraction]
  );

  return (
    <group name="passive-objects">
      {objectElements}
    </group>
  );
}

export * from './types';
export * from './Vehicle';
export * from './Airplane';
export * from './Character';

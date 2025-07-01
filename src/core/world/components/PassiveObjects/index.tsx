import { PhysicsEntity, useGenericRefs } from '@motions/entities';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { PassiveObjectProps, PassiveObject } from './types';
import './styles.css';

interface PassiveObjectInstanceProps {
  object: PassiveObject;
  isSelected: boolean;
  onSelect?: (id: string) => void;
  showDebugInfo?: boolean;
  enableInteraction?: boolean;
}

function PassiveObjectInstance({
  object,
  isSelected,
  onSelect,
  showDebugInfo = false,
  enableInteraction = true
}: PassiveObjectInstanceProps) {
  const refs = useGenericRefs();
  
  if (object.metadata?.modelUrl) {
    return (
      <PhysicsEntity
        url={object.metadata.modelUrl}
        isActive={false}
        componentType={object.type as any}
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
        onCollisionEnter={(payload) => {
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
        onClick={() => enableInteraction && object.interactable && onSelect?.(object.id)}
        onPointerEnter={(e) => {
          if (enableInteraction && object.interactable) {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerLeave={() => {
          document.body.style.cursor = 'default';
        }}
      >
      </group>
    </RigidBody>
  );
}

export function PassiveObjects({ 
  objects, 
  selectedId, 
  onSelect, 
  showDebugInfo = false,
  enableInteraction = true,
  showBoundingBoxes = false,
  showLabels = false,
  onInteract
}: PassiveObjectProps) {
  return (
    <group name="passive-objects">
      {objects.map((obj) => (
        <PassiveObjectInstance
          key={obj.id}
          object={obj}
          isSelected={obj.id === selectedId}
          onSelect={onSelect}
          showDebugInfo={showDebugInfo}
          enableInteraction={enableInteraction}
        />
      ))}
    </group>
  );
}

export * from './types';
export * from './Vehicle';
export * from './Airplane';
export * from './Character';

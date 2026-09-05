import { useGenericRefs } from '@hooks/useGenericRefs';
import { PhysicsEntity } from '@motions/entities/refs/PhysicsEntity';

import { ObjectComponentProps } from '../types';

export function Airplane({
  object,
  selected = false,
  onSelect,
  showDebugInfo = false,
}: ObjectComponentProps) {
  const refs = useGenericRefs();

  const airplaneUrlValue = object.metadata?.['airplaneUrl'] ?? object.metadata?.['modelUrl'];
  const airplaneUrl = typeof airplaneUrlValue === 'string' ? airplaneUrlValue : undefined;
  if (typeof airplaneUrl !== 'string' || airplaneUrl.length === 0) return null;

  const ridingUrlValue = object.metadata?.['ridingUrl'];
  const ridingUrl = typeof ridingUrlValue === 'string' ? ridingUrlValue : undefined;

  const currentAnimationValue = object.metadata?.['currentAnimation'];
  const currentAnimation = typeof currentAnimationValue === 'string' ? currentAnimationValue : 'idle';

  return (
    <PhysicsEntity
      url={airplaneUrl}
      isActive={false}
      componentType="airplane"
      name={`active-airplane-${object.id}`}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      currentAnimation={currentAnimation}
      {...(ridingUrl ? { ridingUrl } : {})}
      ref={refs.rigidBodyRef}
      outerGroupRef={refs.outerGroupRef}
      innerGroupRef={refs.innerGroupRef}
      colliderRef={refs.colliderRef}
      userData={{
        id: object.id,
        type: 'active',
        subType: 'airplane',
        health: object.health,
        maxHealth: object.maxHealth,
        energy: object.energy,
        maxEnergy: object.maxEnergy,
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
          <meshStandardMaterial color="#00ffff" transparent opacity={0.6} />
        </mesh>
      )}
    </PhysicsEntity>
  );
}

import { useEffect } from 'react';
import { useGenericRefs } from '@motions/entities';
import { passiveCharacterPropsType } from './types';
import { PhysicsEntity } from '@motions/entities/refs/PhysicsEntity';

export function PassiveCharacter(props: passiveCharacterPropsType) {
  const refs = useGenericRefs();

  useEffect(() => {
    if (refs.rigidBodyRef && refs.rigidBodyRef.current) {
      refs.rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }, [refs.rigidBodyRef]);

  return (
    <PhysicsEntity
      url={props.url || ''}
      isActive={false}
      componentType="character"
      controllerOptions={
        props.controllerOptions || {
          lerp: {
            cameraTurn: 1,
            cameraPosition: 1,
          },
        }
      }
      position={props.position}
      rotation={props.rotation}
      groundRay={props.groundRay}
      currentAnimation={props.currentAnimation}
      ref={refs.rigidBodyRef}
      outerGroupRef={refs.outerGroupRef}
      innerGroupRef={refs.innerGroupRef}
      colliderRef={refs.colliderRef}
      {...props}
    >
      {props.children}
    </PhysicsEntity>
  );
}

import { useEffect } from 'react';
import { OuterGroupRef } from '../../inner/common/OuterGroupRef';
import { RigidBodyRef } from '../../inner/common/RigidbodyRef';
import { useGenericRefs } from '../../inner/common/useGenericRefs';
import { passiveCharacterPropsType } from './types';

export function PassiveCharacter(props: passiveCharacterPropsType) {
  const refs = useGenericRefs();

  useEffect(() => {
    if (refs.rigidBodyRef && refs.rigidBodyRef.current) {
      refs.rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }, [refs.rigidBodyRef]);

  return (
    <OuterGroupRef ref={refs.outerGroupRef}>
      <RigidBodyRef
        isActive={false}
        componentType={'character'}
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
      </RigidBodyRef>
    </OuterGroupRef>
  );
}

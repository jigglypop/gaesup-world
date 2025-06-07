import { useEffect } from 'react';
import { CharacterInnerRef } from '../../inner/character';
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
    <CharacterInnerRef
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
      {...refs}
      {...props}
    >
      {props.children}
    </CharacterInnerRef>
  );
}

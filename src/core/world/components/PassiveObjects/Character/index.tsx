import { useEffect } from 'react';

import { useGenericRefs } from '@hooks/useGenericRefs';
import { PhysicsEntity } from '@motions/entities/refs/PhysicsEntity';

import { passiveCharacterPropsType } from './types';

export function PassiveCharacter(props: passiveCharacterPropsType) {
  const { children, visible = true, ...entityProps } = props;
  const refs = useGenericRefs();

  useEffect(() => {
    if (refs.rigidBodyRef && refs.rigidBodyRef.current) {
      refs.rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }, [refs.rigidBodyRef]);

  const controllerOptions = entityProps.controllerOptions ?? {
    lerp: {
      cameraTurn: 1,
      cameraPosition: 1,
    },
  };

  return (
    <group visible={visible}>
      <PhysicsEntity
        {...entityProps}
        url={entityProps.url || ''}
        isActive={false}
        componentType="character"
        controllerOptions={controllerOptions}
        ref={refs.rigidBodyRef}
        outerGroupRef={refs.outerGroupRef}
        innerGroupRef={refs.innerGroupRef}
        colliderRef={refs.colliderRef}
      >
        {children}
      </PhysicsEntity>
    </group>
  );
}

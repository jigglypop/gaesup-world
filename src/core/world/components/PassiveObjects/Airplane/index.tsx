import { quat, euler, vec3 } from '@react-three/rapier';
import { PhysicsEntity, useGenericRefs } from '@motions/entities';
import { useFrame } from '@react-three/fiber';
import { passiveAirplanePropsType } from './types';
import { useMemo } from 'react';

export function PassiveAirplane(props: passiveAirplanePropsType) {
  const refs = useGenericRefs();

  return (
    <PhysicsEntity
      url={props.url || ''}
      isActive={false}
      componentType="airplane"
      name="airplane"
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

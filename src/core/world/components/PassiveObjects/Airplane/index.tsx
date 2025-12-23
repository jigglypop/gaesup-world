import { useGenericRefs } from '@hooks/useGenericRefs';
import { PhysicsEntity } from '@motions/entities/refs/PhysicsEntity';

import { passiveAirplanePropsType } from './types';

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

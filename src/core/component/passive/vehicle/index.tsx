import { PhysicsEntity, useGenericRefs } from '@motions/entities';
import { passiveVehiclePropsType } from './types';

export function PassiveVehicle(props: passiveVehiclePropsType) {
  const refs = useGenericRefs();
  return (
    <PhysicsEntity
      url={props.url || ''}
      isActive={false}
      componentType="vehicle"
      name="vehicle"
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

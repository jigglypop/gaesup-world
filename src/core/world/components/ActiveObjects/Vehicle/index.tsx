import { PhysicsEntity } from '@/core/motions/entities/refs/PhysicsEntity';

import { activeVehicleInnerType } from './types';

export function Vehicle(props: activeVehicleInnerType) {
  return (
    <PhysicsEntity
      name="vehicle"
      isActive={true}
      currentAnimation="idle"
      componentType="vehicle"
      ridingUrl={props.ridingUrl}
      ref={props.rigidBodyRef}
      outerGroupRef={props.outerGroupRef}
      innerGroupRef={props.innerGroupRef}
      colliderRef={props.colliderRef}
      {...props}
    >
      {props.children}
    </PhysicsEntity>
  );
}

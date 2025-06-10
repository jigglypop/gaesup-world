import { PhysicsEntity } from '../../../physics/components';
import { activeAirplaneInnerType } from './type';

export function AirplaneRef(props: activeAirplaneInnerType) {
  return (
    <PhysicsEntity
      name="airplane"
      isActive={true}
      currentAnimation="idle"
      componentType="airplane"
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

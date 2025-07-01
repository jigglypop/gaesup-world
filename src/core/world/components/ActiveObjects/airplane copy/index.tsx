import { PhysicsEntity } from '@motions/entities';
import { activeAirplaneInnerType } from './type';

export function Airplane(props: activeAirplaneInnerType) {
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

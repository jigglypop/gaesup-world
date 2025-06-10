import { OuterGroupRef } from '../../inner/common/OuterGroupRef';
import { RigidBodyRef } from '../../inner/common/RigidbodyRef';
import { activeVehicleInnerType } from './types';

export function VehicleRef(props: activeVehicleInnerType) {
  return (
    <OuterGroupRef ref={props.outerGroupRef}>
      <RigidBodyRef
        name={'vehicle'}
        isActive={true}
        currentAnimation={'idle'}
        componentType={'vehicle'}
        ridingUrl={props.ridingUrl}
        ref={props.rigidBodyRef}
        outerGroupRef={props.outerGroupRef}
        innerGroupRef={props.innerGroupRef}
        colliderRef={props.colliderRef}
        {...props}
      >
        {props.children}
      </RigidBodyRef>
    </OuterGroupRef>
  );
}

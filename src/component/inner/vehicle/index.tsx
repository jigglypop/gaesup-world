import { OuterGroupRef } from '../common/OuterGroupRef';
import { RigidBodyRef } from '../common/RigidbodyRef';
import { vehicleInnerType } from './type';

export function VehicleInnerRef(props: vehicleInnerType) {
  const { rigidBodyRef, outerGroupRef } = props;
  return (
    <OuterGroupRef ref={outerGroupRef}>
      <RigidBodyRef
        ref={rigidBodyRef}
        name={props.name}
        componentType={'vehicle'}
        ridingUrl={props.ridingUrl}
        {...props}
      >
        {props.children}
      </RigidBodyRef>
    </OuterGroupRef>
  );
}

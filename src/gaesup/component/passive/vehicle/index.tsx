import { useGenericRefs } from '../../inner/common/useGenericRefs';
import { VehicleInnerRef } from '../../inner/vehicle';
import { passiveVehiclePropsType } from './type';

export function PassiveVehicle(props: passiveVehiclePropsType) {
  const { rigidBodyRef, outerGroupRef, innerGroupRef, colliderRef } = useGenericRefs();

  const refs = {
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    colliderRef,
  };

  return (
    <VehicleInnerRef isActive={false} componentType="vehicle" name="vehicle" {...props} {...refs}>
      {props.children}
    </VehicleInnerRef>
  );
}

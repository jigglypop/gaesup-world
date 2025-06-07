import { useGenericRefs } from '../../inner/common/useGenericRefs';
import { VehicleInnerRef } from '../../inner/vehicle';
import { PassiveRideableProps } from '../types';
import { passiveVehiclePropsType } from './types';

function PassiveRideable<T extends 'vehicle' | 'airplane'>({
  componentType,
  ...props
}: PassiveRideableProps<T>) {
  const refs = useGenericRefs();

  const InnerComponent = componentType === 'vehicle' ? VehicleInnerRef : null;

  if (!InnerComponent) return null;

  return (
    <InnerComponent
      isActive={false}
      componentType={componentType}
      name={componentType}
      {...props}
      {...refs}
    >
      {props.children}
    </InnerComponent>
  );
}

export function PassiveVehicle(props: passiveVehiclePropsType) {
  return <PassiveRideable componentType="vehicle" {...props} />;
}

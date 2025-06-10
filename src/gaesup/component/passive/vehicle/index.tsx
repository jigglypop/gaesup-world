import { OuterGroupRef } from '../../inner/common/OuterGroupRef';
import { RigidBodyRef } from '../../inner/common/RigidbodyRef';
import { useGenericRefs } from '../../inner/common/useGenericRefs';
import { passiveVehiclePropsType } from './types';

export function PassiveVehicle(props: passiveVehiclePropsType) {
  const refs = useGenericRefs();

  return (
    <OuterGroupRef ref={refs.outerGroupRef}>
      <RigidBodyRef
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
      </RigidBodyRef>
    </OuterGroupRef>
  );
}

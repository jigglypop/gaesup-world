import { useGenericRefs } from '@hooks/useGenericRefs';
import { PhysicsEntity } from '@motions/entities/refs/PhysicsEntity';

import { passiveVehiclePropsType } from './types';

export function PassiveVehicle(props: passiveVehiclePropsType) {
  const { children, visible = true, ...entityProps } = props;
  const refs = useGenericRefs();
  return (
    <group visible={visible}>
      <PhysicsEntity
        {...entityProps}
        url={entityProps.url || ''}
        isActive={false}
        componentType="vehicle"
        name={entityProps.name ?? 'vehicle'}
        ref={refs.rigidBodyRef}
        outerGroupRef={refs.outerGroupRef}
        innerGroupRef={refs.innerGroupRef}
        colliderRef={refs.colliderRef}
      >
        {children}
      </PhysicsEntity>
    </group>
  );
}

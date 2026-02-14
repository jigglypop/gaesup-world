import { useGenericRefs } from '@hooks/useGenericRefs';
import { PhysicsEntity } from '@motions/entities/refs/PhysicsEntity';

import { passiveAirplanePropsType } from './types';

export function PassiveAirplane(props: passiveAirplanePropsType) {
  const { children, visible = true, ...entityProps } = props;
  const refs = useGenericRefs();

  return (
    <group visible={visible}>
      <PhysicsEntity
        {...entityProps}
        url={entityProps.url || ''}
        isActive={false}
        componentType="airplane"
        name={entityProps.name ?? 'airplane'}
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

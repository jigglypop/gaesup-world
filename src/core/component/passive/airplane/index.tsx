import { quat, euler, vec3 } from '@react-three/rapier';
import { PhysicsEntity, useGenericRefs } from '@motions/entities';
import { useFrame } from '@react-three/fiber';
import { passiveAirplanePropsType } from './types';
import { useMemo } from 'react';

export function PassiveAirplane(props: passiveAirplanePropsType) {
  const { rigidBodyRef, outerGroupRef, innerGroupRef, colliderRef } = useGenericRefs();
  const safePosition = props.position || vec3(0, 0, 0);
  const safeRotation = props.rotation || euler(0, 0, 0);
  const gravityScale = useMemo(() => {
    return safePosition.y < 10 ? ((1 - 0.1) / (0 - 10)) * safePosition.y + 1 : 0.1;
  }, [safePosition.y]);
  const targetRotation = useMemo(() => {
    const _euler = safeRotation.clone();
    _euler.y = 0;
    return _euler;
  }, [safeRotation]);

  useFrame(() => {
    if (innerGroupRef.current) {
      innerGroupRef.current.setRotationFromQuaternion(
        quat()
          .setFromEuler(innerGroupRef.current.rotation.clone())
          .slerp(quat().setFromEuler(targetRotation), 0.2),
      );
    }
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setGravityScale(gravityScale, false);
    }
  });

  return (
    <PhysicsEntity
      url={props.url || ''}
      isActive={false}
      componentType="airplane"
      name="airplane"
      position={safePosition}
      rotation={safeRotation}
      ref={rigidBodyRef}
      outerGroupRef={outerGroupRef}
      innerGroupRef={innerGroupRef}
      colliderRef={colliderRef}
      {...props}
    >
      {props.children}
    </PhysicsEntity>
  );
}

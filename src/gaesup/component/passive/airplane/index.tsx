import { useFrame } from '@react-three/fiber';
import { quat } from '@react-three/rapier';
import { useGenericRefs } from '../../inner/common/useGenericRefs';
import { passiveAirplanePropsType } from './type';
import { AirplaneInnerRef } from '../../inner/airplane';

export function PassiveAirplane(props: passiveAirplanePropsType) {
  const { rigidBodyRef, outerGroupRef, innerGroupRef, colliderRef } = useGenericRefs();
  useFrame(() => {
    if (innerGroupRef.current) {
      const _euler = props.rotation.clone();
      _euler.y = 0;
      innerGroupRef.current.setRotationFromQuaternion(
        quat()
          .setFromEuler(innerGroupRef.current.rotation.clone())
          .slerp(quat().setFromEuler(_euler), 0.2),
      );
    }
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setGravityScale(
        props.position.y < 10 ? ((1 - 0.1) / (0 - 10)) * props.position.y + 1 : 0.1,
        false,
      );
    }
  });

  const refs = {
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    colliderRef,
  };

  return (
    <AirplaneInnerRef
      isActive={false}
      componentType="airplane"
      name="airplane"
      {...props}
      {...refs}
    >
      {props.children}
    </AirplaneInnerRef>
  );
}

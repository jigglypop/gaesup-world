import { quat, euler, vec3 } from '@react-three/rapier';
import { useGenericRefs } from '../../inner/common/useGenericRefs';
import { useUnifiedFrame } from '../../../hooks/useUnifiedFrame';
import { passiveAirplanePropsType } from './type';
import { AirplaneInnerRef } from '../../inner/airplane';
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

  // 통합 프레임 시스템 사용 (우선순위: 3 - 패시브 객체)
  useUnifiedFrame(
    `passive-airplane-${props.name || 'unnamed'}`,
    () => {
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
    },
    3, // 패시브 객체 우선순위
    !!(innerGroupRef.current || rigidBodyRef.current)
  );

  // 동일: refs 객체 통합
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
      position={safePosition}
      rotation={safeRotation}
      {...refs}
    >
      {props.children}
    </AirplaneInnerRef>
  );
}

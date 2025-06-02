import { quat } from "@react-three/rapier";
import { calcType } from "../type";

export default function innerCalc(prop: calcType) {
  const {
    rigidBodyRef,
    innerGroupRef,
    controllerContext: {
      character: { linearDamping },
    },
    worldContext: { activeState, states },
    delta,
  } = prop;
  // Linear damping 설정 - 점프/떨어질 때는 매우 낮게 설정하여 자연스러운 중력 유지
  if (states.isJumping || states.isFalling) {
    // 점프/떨어질 때는 damping을 매우 낮게 하여 Y축 velocity에 방해되지 않도록
    rigidBodyRef.current.setLinearDamping(0.1);
  } else {
    // 지면에 있을 때만 정상적인 damping 적용
    rigidBodyRef.current.setLinearDamping(
      states.isNotMoving ? linearDamping * 3 : linearDamping
    );
  }
  
  rigidBodyRef.current.setEnabledRotations(false, false, false, false);
  
  // 떨림 방지: 회전 보간 안정화
  const targetQuaternion = quat().setFromEuler(activeState.euler);
  const currentQuaternion = innerGroupRef.current.quaternion;
  
  // 회전 차이가 임계값보다 클 때만 보간 적용
  const rotationThreshold = 0.01;
  const angleDifference = currentQuaternion.angleTo(targetQuaternion);
  
  if (angleDifference > rotationThreshold) {
    // 떨림 방지: 회전 속도 감소 (10 → 6)
    innerGroupRef.current.quaternion.rotateTowards(
      targetQuaternion,
      6 * delta
    );
  }
}

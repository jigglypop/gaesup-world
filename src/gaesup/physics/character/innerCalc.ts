import { quat } from "@react-three/rapier";
import { calcType } from "../type";

export default function innerCalc(prop: calcType) {
  const {
    rigidBodyRef,
    innerGroupRef,
    controllerContext: {
      character: { linearDamping },
    },
    worldContext: { activeState, states, block },
    delta,
  } = prop;

  if (states.isJumping || rigidBodyRef.current.linvel().y < 0) {
    rigidBodyRef.current.setLinearDamping(linearDamping);
  } else {
    rigidBodyRef.current.setLinearDamping(
      states.isNotMoving ? linearDamping * 5 : linearDamping
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

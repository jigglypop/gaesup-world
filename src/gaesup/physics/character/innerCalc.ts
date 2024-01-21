import { quat, vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

export default function innerCalc(prop: calcPropType) {
  const {
    rigidBodyRef,
    innerGroupRef,
    controllerContext: {
      character: { linearDamping },
    },
    worldContext: { activeState, states },
    dispatch,
    delta,
  } = prop;

  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());
  if (states.isJumping || rigidBodyRef.current.linvel().y < 0) {
    rigidBodyRef.current.setLinearDamping(linearDamping);
  } else {
    rigidBodyRef.current.setLinearDamping(
      states.isNotMoving ? linearDamping * 5 : linearDamping
    );
  }
  rigidBodyRef.current.setEnabledRotations(false, false, false, false);
  innerGroupRef.current.quaternion.rotateTowards(
    quat().setFromEuler(activeState.euler),
    10 * delta
  );
  dispatch({
    type: "update",
    payload: {
      activeState: {
        ...activeState,
      },
    },
  });
}

import { quat, vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

export default function innerCalc(prop: calcPropType) {
  const {
    rigidBodyRef,
    innerGroupRef,
    controllerContext: {
      character: { linearDamping },
    },
    worldContext: { activeState },
    dispatch,
    delta,
  } = prop;
  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());
  rigidBodyRef.current.setLinearDamping(linearDamping);
  rigidBodyRef.current.setEnabledRotations(false, false, false, false);
  // rigidBodyRef.current.setTranslation(activeState.position.clone(), false);

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

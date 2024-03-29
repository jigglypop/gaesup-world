import { quat, vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

export default function innerCalc(prop: calcPropType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
    dispatch,
  } = prop;
  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());

  rigidBodyRef.current.setRotation(
    quat().setFromEuler(activeState.euler.clone()),
    false
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

import { quat, vec3 } from "@react-three/rapier";
import { calcType } from "../type";

export default function innerCalc(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
    dispatch,
  } = prop;

  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());

  const _euler = activeState.euler.clone();
  _euler.x = 0;
  _euler.z = 0;
  rigidBodyRef.current.setRotation(quat().setFromEuler(_euler), true);

  dispatch({
    type: "update",
    payload: {
      activeState: {
        ...activeState,
      },
    },
  });
}

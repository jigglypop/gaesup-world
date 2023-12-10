import { vec3 } from "@react-three/rapier";
import { calcPropType } from "../type";

export default function currentSetting(prop: calcPropType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
    dispatch,
  } = prop;
  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());
  dispatch({
    type: "update",
    payload: {
      activeState: {
        ...activeState,
      },
    },
  });
}

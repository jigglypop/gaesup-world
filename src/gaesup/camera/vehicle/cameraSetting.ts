import { vec3 } from "@react-three/rapier";
import { cameraPropType } from "../../physics";

export default function cameraSetting(prop: cameraPropType) {
  const { rigidBodyRef, state } = prop;
  const [current] = prop.current;
  state.camera.quaternion.copy(current.quat);
  state.camera.lookAt(vec3(rigidBodyRef.current.translation()));
}

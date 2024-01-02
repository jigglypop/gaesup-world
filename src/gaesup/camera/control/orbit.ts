import { quat } from "@react-three/rapier";
import { cameraPropType } from "../../physics/type";
import { V3 } from "../../utils/vector";

export default function orbit(prop: cameraPropType) {
  const {
    state,
    worldContext: { activeState, cameraOption },
  } = prop;
  if (!state || !state.camera) return;
  const cameraPosition = activeState.position.clone().add(
    V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y))
      .normalize()
      .clone()
      .multiplyScalar(-cameraOption.XZDistance)
      // .multiplyScalar(-1)
      .add(V3(0, cameraOption.YDistance, 0))
  );

  state.camera.position.lerp(cameraPosition, 0.9);
  state.camera.quaternion.copy(
    activeState.quat
      .clone()
      .multiply(quat().setFromAxisAngle(V3(0, 1, 0), Math.PI))
  );
  state.camera.lookAt(activeState.position.clone());
}

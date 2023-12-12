import { quat } from "@react-three/rapier";
import { cameraPropType } from "../../physics/type";
import { V3 } from "../../utils/vector";

export default function orbit(prop: cameraPropType) {
  const {
    state,
    controllerContext: { perspectiveCamera },
    worldContext: { activeState },
  } = prop;
  const cameraPosition = activeState.position.clone().add(
    V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y))
      .normalize()
      .clone()
      .multiplyScalar(perspectiveCamera.XZDistance)
      .multiplyScalar(perspectiveCamera.isFront ? -1 : 1)
      .add(V3(0, perspectiveCamera.YDistance, 0))
  );

  state.camera.position.lerp(cameraPosition, 1);
  state.camera.quaternion.copy(
    activeState.quat
      .clone()
      .multiply(
        perspectiveCamera.isFront
          ? quat().setFromAxisAngle(V3(0, 1, 0), Math.PI)
          : quat()
      )
  );
  state.camera.lookAt(activeState.position);
}
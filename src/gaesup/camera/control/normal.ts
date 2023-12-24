import { cameraPropType } from "../../physics/type";
import { V3 } from "../../utils/vector";

export default function normal(prop: cameraPropType) {
  const {
    state,
    controllerContext: { perspectiveCamera },
    worldContext: { activeState },
  } = prop;
  const cameraPosition = activeState.position
    .clone()
    .add(V3(0, perspectiveCamera.YDistance, perspectiveCamera.XZDistance));

  state.camera.position.lerp(cameraPosition, 0.9);
  state.camera.lookAt(activeState.position.clone());
}

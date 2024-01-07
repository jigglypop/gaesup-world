import { cameraPropType } from "../../physics/type";
import { V3 } from "../../utils/vector";

export default function normal(prop: cameraPropType) {
  const {
    state,
    worldContext: { activeState, cameraOption },
  } = prop;
  if (!state || !state.camera) return;
  const cameraPosition = activeState.position
    .clone()
    .add(V3(0, cameraOption.YDistance, cameraOption.XZDistance));

  state.camera.position.lerp(cameraPosition, 1);
  state.camera.lookAt(activeState.position.clone());
}

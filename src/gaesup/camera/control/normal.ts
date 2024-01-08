import { cameraPropType } from "../../physics/type";
import { V3 } from "../../utils/vector";
import { activeStateType, cameraOptionType } from "../../world/context/type";

export const makeNormalCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType
) => {
  const { YDistance, ZDistance } = cameraOption;
  const cameraPosition = activeState.position
    .clone()
    .add(V3(0, YDistance, ZDistance));
  return cameraPosition;
};
export default function normal(prop: cameraPropType) {
  const {
    state,
    worldContext: { activeState, cameraOption },
  } = prop;
  if (!state || !state.camera) return;
  const cameraPosition = activeState.position
    .clone()
    .add(V3(0, cameraOption.YDistance, cameraOption.ZDistance));

  state.camera.position.lerp(cameraPosition, 1);
  state.camera.lookAt(activeState.position.clone());
}

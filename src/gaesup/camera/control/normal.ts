import { cameraPropType } from "../../physics/type";
import { V3 } from "../../utils/vector";
import { activeStateType, cameraOptionType } from "../../world/context/type";

export const makeNormalCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType
) => {
  const { XDistance, YDistance, ZDistance } = cameraOption;
  const cameraPosition = activeState.position
    .clone()
    .add(V3(XDistance, YDistance, ZDistance));
  return cameraPosition;
};
export default function normal(prop: cameraPropType) {
  const {
    state,
    worldContext: { cameraOption },
    controllerOptions: { lerp },
  } = prop;
  if (!state || !state.camera) return;
  state.camera.position.lerp(
    cameraOption.position.clone(),
    lerp.cameraPosition
  );
  state.camera.lookAt(cameraOption.target);
}

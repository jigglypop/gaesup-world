import { quat } from "@react-three/rapier";
import { cameraPropType } from "../../physics/type";
import { V3 } from "../../utils/vector";
import { activeStateType, cameraOptionType } from "../../world/context/type";

export const makeOrbitCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType
) => {
  const { XDistance, YDistance, ZDistance } = cameraOption;
  const cameraPosition = activeState.position.clone().add(
    V3(Math.sin(activeState.euler.y), 1, Math.cos(activeState.euler.y))
      .normalize()
      .clone()
      .multiply(V3(-XDistance, YDistance, -ZDistance))
  );
  return cameraPosition;
};

export default function orbit(prop: cameraPropType) {
  const {
    state,
    worldContext: { activeState, cameraOption },
  } = prop;
  if (!state || !state.camera) return;
  const cameraPosition = makeOrbitCameraPosition(activeState, cameraOption);

  state.camera.position.lerp(cameraPosition, 1);
  state.camera.quaternion.copy(
    activeState.quat
      .clone()
      .multiply(quat().setFromAxisAngle(V3(0, 1, 0), Math.PI))
  );
  state.camera.rotation.copy(activeState.euler);
  state.camera.lookAt(activeState.position.clone());
}

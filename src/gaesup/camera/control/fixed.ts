import { CameraPropType } from '../type';

export default function fixed(prop: CameraPropType): void {
  const { state, cameraOption } = prop;
  if (!state?.camera || !cameraOption.fixedPosition) return;
  state.camera.position.copy(cameraOption.fixedPosition);
  if (cameraOption.lookAtTarget) {
    state.camera.lookAt(cameraOption.lookAtTarget);
  } else if (cameraOption.fixedRotation) {
    state.camera.rotation.copy(cameraOption.fixedRotation);
  }
}

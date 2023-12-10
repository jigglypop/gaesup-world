import { cameraPropType } from "../../physics/type";

export default function normal(prop: cameraPropType) {
  const {
    state,
    cameraRay,
    constant,
    checkCollision,
    delta,
    worldContext: { activeState },
  } = prop;
  cameraRay.pivot.position.lerp(
    activeState.position,
    1 - Math.exp(-constant.cameraCamFollow * delta)
  );
  state.camera.position.set(0, 0, 0);
  state.camera.lookAt(cameraRay.pivot.position);
  checkCollision(delta);
}

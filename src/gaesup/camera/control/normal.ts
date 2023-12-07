import { cameraPropType } from "../../physics";

export default function normal(prop: cameraPropType) {
  const { state, cameraRay, constant, checkCollision, delta } = prop;
  const [current] = prop.current;
  cameraRay.pivot.position.lerp(
    current.position,
    1 - Math.exp(-constant.cameraCamFollow * delta)
  );
  state.camera.position.set(0, 0, 0);
  state.camera.lookAt(cameraRay.pivot.position);
  checkCollision(delta);
}

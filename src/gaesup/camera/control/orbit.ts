import { cameraPropType } from "@physics/index";
import { quat, vec3 } from "@react-three/rapier";
import { V3 } from "@utils/vector";

export default function orbit(prop: cameraPropType) {
  const { state } = prop;
  const [current] = prop.current;
  const [options] = prop.option;
  const { rigidBodyRef } = prop;

  const dir = V3(
    Math.sin(current.euler.y),
    0,
    Math.cos(current.euler.y)
  ).normalize();
  let cameraPosition = vec3(rigidBodyRef.current.translation())
    .clone()
    .add(
      dir
        .clone()
        .multiplyScalar(options.perspectiveCamera.XZDistance)
        .multiplyScalar(options.perspectiveCamera.isFront ? -1 : 1)
        .add(V3(0, options.perspectiveCamera.YDistance, 0))
    );

  state.camera.position.lerp(cameraPosition, 0.2);
  state.camera.quaternion.copy(
    current.quat
      .clone()
      .multiply(
        options.perspectiveCamera.isFront
          ? quat().setFromAxisAngle(V3(0, 1, 0), Math.PI)
          : quat()
      )
  );
  state.camera.lookAt(vec3(rigidBodyRef.current.translation()));
}

import { quat } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
export default function orbit(prop) {
    var state = prop.state, perspectiveCamera = prop.controllerContext.perspectiveCamera, activeState = prop.worldContext.activeState;
    var cameraPosition = activeState.position.clone().add(V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y))
        .normalize()
        .clone()
        .multiplyScalar(perspectiveCamera.XZDistance)
        .multiplyScalar(perspectiveCamera.isFront ? -1 : 1)
        .add(V3(0, perspectiveCamera.YDistance, 0)));
    state.camera.position.lerp(cameraPosition, 0.9);
    state.camera.quaternion.copy(activeState.quat
        .clone()
        .multiply(perspectiveCamera.isFront
        ? quat().setFromAxisAngle(V3(0, 1, 0), Math.PI)
        : quat()));
    state.camera.lookAt(activeState.position.clone());
}

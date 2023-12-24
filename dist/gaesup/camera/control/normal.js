import { V3 } from "../../utils/vector";
export default function normal(prop) {
    var state = prop.state, perspectiveCamera = prop.controllerContext.perspectiveCamera, activeState = prop.worldContext.activeState;
    var cameraPosition = activeState.position
        .clone()
        .add(V3(0, perspectiveCamera.YDistance, perspectiveCamera.XZDistance));
    state.camera.position.lerp(cameraPosition, 0.9);
    state.camera.lookAt(activeState.position.clone());
}

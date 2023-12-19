import { V3 } from "../../utils/vector";
export default function normal(prop) {
    var state = prop.state, perspectiveCamera = prop.controllerContext.perspectiveCamera, activeState = prop.worldContext.activeState;
    var cameraPosition = activeState.position
        .clone()
        .add(V3(perspectiveCamera.XZDistance, perspectiveCamera.YDistance, 0));
    state.camera.position.lerp(cameraPosition, 1);
    state.camera.lookAt(activeState.position.clone());
}

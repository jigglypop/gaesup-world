import { quat } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
export var makeCameraPosition = function (activeState, cameraOption) {
    var XDistance = cameraOption.XDistance, YDistance = cameraOption.YDistance, ZDistance = cameraOption.ZDistance;
    var cameraPosition = activeState.position.clone().add(V3(Math.sin(activeState.euler.y), 1, Math.cos(activeState.euler.y))
        .normalize()
        .clone()
        .multiply(V3(-XDistance, YDistance, -ZDistance)));
    return cameraPosition;
};
export default function orbit(prop) {
    var state = prop.state, _a = prop.worldContext, activeState = _a.activeState, cameraOption = _a.cameraOption;
    if (!state || !state.camera)
        return;
    var cameraPosition = makeCameraPosition(activeState, cameraOption);
    state.camera.position.lerp(cameraPosition, 1);
    state.camera.quaternion.copy(activeState.quat
        .clone()
        .multiply(quat().setFromAxisAngle(V3(0, 1, 0), Math.PI)));
    state.camera.lookAt(activeState.position.clone());
}

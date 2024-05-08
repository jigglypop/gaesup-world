import { V3 } from "../../utils/vector";
export var makeNormalCameraPosition = function (activeState, cameraOption) {
    var XDistance = cameraOption.XDistance, YDistance = cameraOption.YDistance, ZDistance = cameraOption.ZDistance;
    var cameraPosition = activeState.position
        .clone()
        .add(V3(XDistance, YDistance, ZDistance));
    return cameraPosition;
};
export default function normal(prop) {
    var state = prop.state, cameraOption = prop.worldContext.cameraOption, lerp = prop.controllerOptions.lerp;
    if (!state || !state.camera)
        return;
    state.camera.position.lerp(cameraOption.position.clone(), lerp.cameraPosition);
    state.camera.lookAt(cameraOption.target);
}

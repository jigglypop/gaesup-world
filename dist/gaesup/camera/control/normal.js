import { V3 } from "../../utils/vector";
export var makeNormalCameraPosition = function (activeState, cameraOption) {
    var YDistance = cameraOption.YDistance, ZDistance = cameraOption.ZDistance;
    var cameraPosition = activeState.position
        .clone()
        .add(V3(0, YDistance, ZDistance));
    return cameraPosition;
};
export default function normal(prop) {
    var state = prop.state, _a = prop.worldContext, activeState = _a.activeState, cameraOption = _a.cameraOption;
    if (!state || !state.camera)
        return;
    var cameraPosition = activeState.position
        .clone()
        .add(V3(0, cameraOption.YDistance, cameraOption.ZDistance));
    state.camera.position.lerp(cameraPosition, 1);
    state.camera.lookAt(activeState.position.clone());
}

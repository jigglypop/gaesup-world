import { V3 } from "../../utils/vector";
export var makeNormalCameraPosition = function (activeState, cameraOption) {
    var YDistance = cameraOption.YDistance, ZDistance = cameraOption.ZDistance;
    var cameraPosition = activeState.position
        .clone()
        .add(V3(0, YDistance, ZDistance));
    return cameraPosition;
};
export default function normal(prop) {
    var state = prop.state, cameraOption = prop.worldContext.cameraOption;
    if (!state || !state.camera)
        return;
    state.camera.position.lerp(cameraOption.position.clone(), 1);
    state.camera.lookAt(cameraOption.target);
}
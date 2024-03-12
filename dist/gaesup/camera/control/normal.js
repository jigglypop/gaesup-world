import { V3 } from "../../utils/vector";
export var makeNormalCameraPosition = function (activeState, cameraOption) {
    var YDistance = cameraOption.YDistance, ZDistance = cameraOption.ZDistance;
    var cameraPosition = activeState.position
        .clone()
        .add(V3(0, YDistance, ZDistance));
    return cameraPosition;
};
export default function normal(prop) {
    var delta = prop.delta, state = prop.state, _a = prop.worldContext, activeState = _a.activeState, cameraOption = _a.cameraOption;
    if (!state || !state.camera)
        return;
    // const cameraPosition = activeState.position
    //   .clone()
    //   .add(V3(0, cameraOption.YDistance, cameraOption.ZDistance));
    state.camera.position.lerp(cameraOption.position.clone(), 1);
    state.camera.lookAt(cameraOption.target);
}

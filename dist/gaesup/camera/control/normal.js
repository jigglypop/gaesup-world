import { V3 } from "../../utils/vector";
export default function normal(prop) {
    var state = prop.state, _a = prop.worldContext, activeState = _a.activeState, cameraOption = _a.cameraOption;
    if (!state || !state.camera)
        return;
    var cameraPosition = activeState.position
        .clone()
        .add(V3(0, cameraOption.YDistance, cameraOption.XZDistance));
    state.camera.position.lerp(cameraPosition, 1);
    state.camera.lookAt(activeState.position.clone());
}

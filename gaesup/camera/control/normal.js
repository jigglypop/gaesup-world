import { V3 } from "../../utils/vector";
export const makeNormalCameraPosition = (activeState, cameraOption) => {
    const { XDistance, YDistance, ZDistance } = cameraOption;
    const cameraPosition = activeState.position
        .clone()
        .add(V3(XDistance, YDistance, ZDistance));
    return cameraPosition;
};
export default function normal(prop) {
    const { state, worldContext: { cameraOption }, controllerOptions: { lerp }, } = prop;
    if (!state || !state.camera)
        return;
    state.camera.position.lerp(cameraOption.position.clone(), lerp.cameraPosition);
    state.camera.lookAt(cameraOption.target);
}

export default function mapControl(prop) {
    var state = prop.state, activeState = prop.worldContext.activeState;
    var position = activeState.position.clone();
    state.camera.position.set(-10, 10, -10).add(position);
}

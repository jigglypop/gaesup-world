export default function rotate(prop) {
    var outerGroupRef = prop.outerGroupRef, _a = prop.worldContext, states = _a.states, activeState = _a.activeState;
    if (states.isMoving && outerGroupRef && outerGroupRef.current) {
        states.isRotated =
            Math.sin(outerGroupRef.current.rotation.y).toFixed(3) ===
                Math.sin(activeState.euler.y).toFixed(3);
    }
}

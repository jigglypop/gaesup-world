import { checkPropType } from ".";

export default function rotate(prop: checkPropType) {
  const {
    outerGroupRef,
    worldContext: { states, activeState },
  } = prop;
  if (states.isMoving && outerGroupRef && outerGroupRef.current) {
    states.isRotated =
      Math.sin(outerGroupRef.current.rotation.y).toFixed(3) ===
      Math.sin(activeState.euler.y).toFixed(3);
  }
}

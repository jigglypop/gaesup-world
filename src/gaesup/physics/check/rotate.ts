import { calcPropType } from "../type";

export default function rotate(prop: calcPropType) {
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

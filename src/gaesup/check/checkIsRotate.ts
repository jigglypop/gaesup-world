import { checkPropType } from ".";

export default function checkIsRotate(prop: checkPropType) {
  const { outerGroupRef, context } = prop;
  const [states] = prop.states;
  const [current] = prop.current;
  if (states.isMoving && outerGroupRef && outerGroupRef.current) {
    states.isRotated =
      Math.sin(outerGroupRef.current.rotation.y).toFixed(3) ===
      Math.sin(current.euler.y).toFixed(3);
  }
}

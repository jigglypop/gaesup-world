import { vec3 } from "@react-three/rapier";
import { calcPropType } from "..";

export default function accelaration(prop: calcPropType) {
  const { outerGroupRef, move, constant } = prop;
  const [states] = prop.states;
  const [current] = prop.current;
  const { isMoving, isRunning } = states;
  if (!isMoving) return null;
  const { velocity: movingV } = move;
  const { velocity: currentV, reverseVelocity: reverseV } = current;

  current.direction.applyQuaternion(outerGroupRef.current.quaternion);
  const projectedV = movingV
    .clone()
    .projectOnVector(current.direction)
    .multiply(current.direction);
  const angle = movingV.angleTo(current.direction);
  const runRatio = constant.splintSpeed * (isRunning ? constant.runRate : 1);
  const reverseRatio = isMoving ? 0 : constant.rejectSpeed;
  const runV = projectedV.addScalar(runRatio).multiply(current.direction);
  const moveAngleV = movingV.multiplyScalar(Math.sin(angle));
  const rejectV = reverseV.multiplyScalar(reverseRatio);
  const DT = vec3().set(1 / constant.dT, 0, 1 / constant.dT);
  move.accelation
    .copy(runV)
    .sub(currentV)
    .add(moveAngleV)
    .sub(rejectV)
    .multiply(DT);
}

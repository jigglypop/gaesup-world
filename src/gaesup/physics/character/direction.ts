import { V3, calcAngleByVector } from '../../utils/vector';
import { gaesupWorldContextType } from '../../world/context/type';
import { calcType } from '../type';

export function orbitDirection({
  activeState,
  control,
  mode,
  clicker,
}: Partial<gaesupWorldContextType>) {
  const { forward, backward, leftward, rightward } = control;
  const dirX = Number(leftward) - Number(rightward);
  const dirZ = Number(forward) - Number(backward);
  let start = 0;
  if (mode.controller === 'clicker') {
    activeState.euler.y = Math.PI / 2 - clicker.angle;
    start = 1;
  } else {
    if (dirX === 0 && dirZ === 0) return;
    activeState.euler.y += (dirX * Math.PI) / 32;
    start = dirZ;
  }
  const front = V3(start, 0, start);
  activeState.direction = front.multiply(
    V3(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y)),
  );
  activeState.dir = activeState.direction.normalize();
}

export function normalDirection({
  activeState,
  control,
  mode,
  clicker,
}: Partial<gaesupWorldContextType>) {
  const { forward, backward, leftward, rightward } = control;
  if (mode.controller === 'clicker') {
    activeState.euler.y = Math.PI / 2 - clicker.angle;
    activeState.dir.set(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y));
  } else {
    // 일반 컨트롤
    // right hand rule. north -> east -> south -> west
    const dirX = Number(leftward) - Number(rightward);
    const dirZ = Number(forward) - Number(backward);
    if (dirX === 0 && dirZ === 0) return;
    const dir = V3(dirX, 0, dirZ);
    const angle = calcAngleByVector(dir);
    activeState.euler.y = angle;
    activeState.dir.set(dirX, 0, dirZ);
  }
}

export default function direction(prop: calcType) {
  const { worldContext } = prop;
  if (worldContext.mode.control === 'normal') {
    normalDirection(worldContext);
  } else if (worldContext.mode.control === 'orbit') {
    orbitDirection(worldContext);
  }
}

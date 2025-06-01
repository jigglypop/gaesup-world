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
  
  // 하이브리드 모드: 클리커가 활성화되면 클리커 우선, 아니면 키보드
  if (clicker.isOn) {
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
  
  // 하이브리드 모드: 클리커가 활성화되면 클리커 우선, 아니면 키보드
  if (clicker.isOn) {
    // 클리커 모드 방향 계산
    activeState.euler.y = Math.PI / 2 - clicker.angle;
    activeState.dir.set(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y));
  } else {
    // 키보드 모드 방향 계산
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
  const control = worldContext.mode.control;
  
  if (control === 'thirdPerson' || control === 'normal' || control === 'firstPerson' || control === 'topDown' || control === 'sideScroll') {
    normalDirection(worldContext);
  } else if (control === 'thirdPersonOrbit' || control === 'orbit') {
    orbitDirection(worldContext);
  } else {
    normalDirection(worldContext);
  }
}

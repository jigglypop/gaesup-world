import { V3, calcAngleByVector } from '../../utils/vector';
import { gaesupWorldContextType } from '../../world/context/type';
import { calcType } from '../type';
import { PhysicsInputState } from '../../hooks/usePhysicsInput';

// 새로운 ref 기반 orbit direction 함수
export function orbitDirectionRef({
  activeState,
  inputRef,
}: {
  activeState: any;
  inputRef: { current: PhysicsInputState };
}) {
  const { forward, backward, leftward, rightward } = inputRef.current.keyboard;
  const mouse = inputRef.current.mouse;
  
  const dirX = Number(leftward) - Number(rightward);
  const dirZ = Number(forward) - Number(backward);
  let start = 0;
  
  if (mouse.isActive) {
    activeState.euler.y = Math.PI / 2 - mouse.angle;
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

// 새로운 ref 기반 normal direction 함수
export function normalDirectionRef({
  activeState,
  inputRef,
}: {
  activeState: any;
  inputRef: { current: PhysicsInputState };
}) {
  const { forward, backward, leftward, rightward } = inputRef.current.keyboard;
  const mouse = inputRef.current.mouse;
  
  if (mouse.isActive) {
    activeState.euler.y = Math.PI / 2 - mouse.angle;
    activeState.dir.set(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y));
  } else {
    const dirX = Number(leftward) - Number(rightward);
    const dirZ = Number(forward) - Number(backward);
    if (dirX === 0 && dirZ === 0) return;
    const dir = V3(dirX, 0, dirZ);
    const angle = calcAngleByVector(dir);
    activeState.euler.y = angle;
    activeState.dir.set(dirX, 0, dirZ);
  }
}

// ======================================
// 기존 함수들 (하위 호환성 유지)
// ======================================
export function orbitDirection({
  activeState,
  control,
  clicker,
}: Partial<gaesupWorldContextType>) {
  const { forward, backward, leftward, rightward } = control;
  const dirX = Number(leftward) - Number(rightward);
  const dirZ = Number(forward) - Number(backward);
  let start = 0;
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
  clicker,
}: Partial<gaesupWorldContextType>) {
  const { forward, backward, leftward, rightward } = control;
  if (clicker.isOn) {
    activeState.euler.y = Math.PI / 2 - clicker.angle;
    activeState.dir.set(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y));
  } else {
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
  const { worldContext, inputRef } = prop;
  
  // === 새로운 ref 기반 시스템 우선 사용 ===
  if (inputRef && inputRef.current) {
    const control = worldContext.mode.control;
    
    if (control === 'thirdPerson' || control === 'normal' || control === 'firstPerson' || control === 'topDown' || control === 'sideScroll') {
      normalDirectionRef({ activeState: worldContext.activeState, inputRef });
    } else if (control === 'thirdPersonOrbit' || control === 'orbit') {
      orbitDirectionRef({ activeState: worldContext.activeState, inputRef });
    } else {
      normalDirectionRef({ activeState: worldContext.activeState, inputRef });
    }
    return;
  }
  
  // === 기존 시스템 fallback (하위 호환성) ===
  const control = worldContext.mode.control;
  
  if (control === 'thirdPerson' || control === 'normal' || control === 'firstPerson' || control === 'topDown' || control === 'sideScroll') {
    normalDirection(worldContext);
  } else if (control === 'thirdPersonOrbit' || control === 'orbit') {
    orbitDirection(worldContext);
  } else {
    normalDirection(worldContext);
  }
}

import { vec3 } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
import { calcType } from "../type";
import { PhysicsInputState } from "../../hooks/usePhysicsInput";

// 새로운 ref 기반 normal 함수
export function normalRef(prop: calcType) {
  const { worldContext: { activeState }, inputRef } = prop;
  
  if (!inputRef || !inputRef.current) {
    // fallback to original function
    return normal(prop);
  }
  
  const { forward, backward, leftward, rightward } = inputRef.current.keyboard;
  const xAxis = Number(leftward) - Number(rightward);
  const zAxis = Number(forward) - Number(backward);
  const front = vec3().set(zAxis, 0, zAxis);
  activeState.euler.y += xAxis * (Math.PI / 64);
  return front;
}

// ======================================
// 기존 함수 (하위 호환성 유지)
// ======================================
export function normal(prop: calcType) {
  const {
    worldContext: { activeState, control },
  } = prop;
  const { forward, backward, leftward, rightward } = control;
  const xAxis = Number(leftward) - Number(rightward);
  const zAxis = Number(forward) - Number(backward);
  const front = vec3().set(zAxis, 0, zAxis);
  activeState.euler.y += xAxis * (Math.PI / 64);
  return front;
}

export default function direction(prop: calcType) {
  const {
    worldContext: { mode, activeState },
    inputRef
  } = prop;
  
  const front = vec3();
  
  // === 새로운 ref 기반 시스템 우선 사용 ===
  if (inputRef && inputRef.current) {
    front.copy(normalRef(prop));
  } else {
    // === 기존 시스템 fallback (하위 호환성) ===
    front.copy(normal(prop));
  }
  
  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y))
  );
  activeState.dir = activeState.direction.normalize();
}

// import { calcType } from '../type';
// import { vec3 } from '@react-three/rapier';
//
// export function rotate(prop: calcType) {
//   const {
//     outerGroupRef,
//     worldContext: { states, activeState },
//   } = prop;
//   if (states.isMoving && outerGroupRef && outerGroupRef.current) {
//     states.isRotated =
//       Math.sin(outerGroupRef.current.rotation.y).toFixed(3) ===
//       Math.sin(activeState.euler.y).toFixed(3);
//   }
// }
//
// export function riding(prop: calcType) {
//   const {
//     worldContext: { states },
//   } = prop;
//
//   const { isRiderOn } = states;
//   if (isRiderOn && states.isPush['keyR']) {
//     states.isRiding = true;
//   }
// }
//
// export function push(prop: calcType) {
//   const {
//     worldContext: { states, control },
//   } = prop;
//   Object.keys(control).forEach((key) => {
//     states.isPush[key] = control[key];
//   });
// }
//
// export function moving(prop: calcType) {
//   const {
//     worldContext: { states, mode, control, clicker, clickerOption },
//   } = prop;
//   const { shift, space } = control;
//   if (mode.controller === 'clicker') {
//     states.isMoving = clicker.isOn;
//     states.isNotMoving = !clicker.isOn;
//     states.isRunning = (shift || clicker.isRun) && states.isMoving && clickerOption.isRun;
//     states.isJumping = space;
//   }
// }
//
// export function ground(prop: calcType) {
//   const {
//     colliderRef,
//     groundRay,
//     worldContext: { states, activeState },
//   } = prop;
//
//   groundRay.origin.addVectors(activeState.position, vec3(groundRay.offset));
//   if (!groundRay.hit || !groundRay.rayCast || !colliderRef.current) {
//     states.isOnTheGround = false;
//   }
//   if (groundRay.hit) {
//     const MAX = groundRay.length * 2;
//     const MIN = groundRay.length * 0.8;
//     if (groundRay.hit.toi >= MAX) {
//       states.isFalling = true;
//       states.isOnTheGround = false;
//     } else if (MIN <= groundRay.hit.toi && groundRay.hit.toi < MAX) {
//       states.isFalling = true;
//     } else if (groundRay.hit.toi < MIN) {
//       states.isFalling = false;
//       states.isOnTheGround = true;
//     }
//   }
// }
//
// export default function check(calcProp: calcType) {
//   ground(calcProp);
//   moving(calcProp);
//   rotate(calcProp);
//   push(calcProp);
//   riding(calcProp);
// }
// physics/check.ts
import { calcType } from '../type';
import { vec3 } from '@react-three/rapier';

export default function check(prop: calcType) {
  const { worldContext, colliderRef, groundRay, outerGroupRef } = prop;
  const { states, activeState, mode, control, clicker, clickerOption } = worldContext;

  // 지면 체크
  if (groundRay) {
    groundRay.origin.addVectors(activeState.position, vec3(groundRay.offset));

    // 레이캐스트 상태 확인
    const isRayValid = groundRay.hit && groundRay.rayCast && colliderRef?.current;
    states.isOnTheGround = isRayValid ? false : states.isOnTheGround;

    if (groundRay.hit) {
      const MAX = groundRay.length * 2;
      const MIN = groundRay.length * 0.8;
      const toi = groundRay.hit.toi;

      if (toi >= MAX) {
        states.isFalling = true;
        states.isOnTheGround = false;
      } else if (MIN <= toi && toi < MAX) {
        states.isFalling = true;
      } else if (toi < MIN) {
        states.isFalling = false;
        states.isOnTheGround = true;
      }
    }
  }

  // 이동 상태 체크
  if (mode.controller === 'clicker') {
    states.isMoving = clicker.isOn;
    states.isNotMoving = !clicker.isOn;
    states.isRunning = (control.shift || clicker.isRun) && states.isMoving && clickerOption.isRun;
    states.isJumping = control.space;
  }

  // 회전 상태 체크
  if (states.isMoving && outerGroupRef?.current) {
    states.isRotated =
      Math.sin(outerGroupRef.current.rotation.y).toFixed(3) ===
      Math.sin(activeState.euler.y).toFixed(3);
  }

  // 키 입력 상태 업데이트
  Object.keys(control).forEach((key) => {
    states.isPush[key] = control[key];
  });

  // 탑승 상태 체크
  if (states.isRiderOn && states.isPush['keyR']) {
    states.isRiding = true;
  }

  return states;
}

import { RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { calcNorm } from '../../utils';
import { calcType, PhysicsData, PurePhysicsCalcType } from '../type';

export function calculateCharacterQueue(
  rigidBodyRef: PurePhysicsCalcType['rigidBodyRef'],
  physicsData: PhysicsData,
  updateMouse: PurePhysicsCalcType['updateMouse'],
  state: RootState,
) {
  //   if (!rigidBodyRef.current) return;
  //
  //   const { mouse, clickerOption } = physicsData;
  //   const currentPos = rigidBodyRef.current.translation();
  //   const clickerPoint = mouse.target;
  //   const clickerIsOn = mouse.isActive;
  //
  //   const norm = calcNorm(currentPos, clickerPoint, false);
  //
  //   if (norm < 1 && clickerIsOn) {
  //     if (clickerOption.track && clickerOption.queue.length !== 0) {
  //       const Q = clickerOption.queue.shift();
  //       if (Q instanceof THREE.Vector3) {
  //         const newAngle = Math.atan2(Q.z - currentPos.z, Q.x - currentPos.x);
  //
  //         updateMouse({
  //           target: Q,
  //           angle: newAngle,
  //         });
  //       } else if (Q && 'action' in Q) {
  //         const { action, beforeCB, afterCB, time } = Q;
  //         if (action === 'stop') {
  //           state.clock.stop();
  //           beforeCB(state);
  //           setTimeout(() => {
  //             state.clock.start();
  //             afterCB(state);
  //           }, time);
  //         }
  //       }
  //       if (clickerOption.loop && Q) {
  //         clickerOption.queue.push(Q);
  //       }
  //     } else {
  //       updateMouse({
  //         isActive: false,
  //         shouldRun: false,
  //       });
  //     }
  //   }
}

export default function queue(prop: calcType) {
  const { rigidBodyRef, state, worldContext, inputRef, setMouseInput } = prop;

  if (!worldContext?.clickerOption || !inputRef?.current) return;

  const currentPos = rigidBodyRef.current?.translation();
  if (!currentPos) return;

  const mouse = inputRef.current.mouse;
  const clickerPoint = mouse.target;
  const clickerIsOn = mouse.isActive;
  const { clickerOption } = worldContext;

  // Rapier Vector를 THREE.Vector3로 변환
  const currentPosVector3 = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
  const norm = calcNorm(currentPosVector3, clickerPoint, false);

  if (norm < 1 && clickerIsOn) {
    if (clickerOption.track && clickerOption.queue.length !== 0) {
      const Q = clickerOption.queue.shift();
      if (Q instanceof THREE.Vector3) {
        const newAngle = Math.atan2(Q.z - currentPos.z, Q.x - currentPos.x);

        if (setMouseInput) {
          setMouseInput({
            target: Q,
            angle: newAngle,
          });
        }
      } else if (Q && 'action' in Q) {
        const { action, beforeCB, afterCB, time } = Q;
        if (action === 'stop') {
          state?.clock.stop();
          beforeCB(state);
          setTimeout(() => {
            state?.clock.start();
            afterCB(state);
          }, time);
        }
      }
      if (clickerOption.loop && Q) {
        clickerOption.queue.push(Q);
      }
    } else {
      if (setMouseInput) {
        setMouseInput({
          isActive: false,
          shouldRun: false,
        });
      }
    }
  }
}

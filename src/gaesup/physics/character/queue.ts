import { vec3 } from "@react-three/rapier";
import * as THREE from "three";
import { calcNorm } from "../../utils";
import { calcType } from "../type";

export default function queue(prop: calcType) {
  const {
    rigidBodyRef,
    state,
    worldContext: { clickerOption },
    inputRef,
    setMouseInput
  } = prop;
  
  const u = vec3(rigidBodyRef.current?.translation());
  
  // === ref 기반 시스템 사용 ===
  if (!inputRef || !inputRef.current) {
    // inputRef가 없으면 early return
    return;
  }
  
  const mouse = inputRef.current.mouse;
  const clickerPoint = mouse.target;
  const clickerIsOn = mouse.isActive;
  const clickerIsRun = mouse.shouldRun;
  
  let norm = calcNorm(u, clickerPoint, false);
  
  // 클리커가 활성화되어 있고 목적지에 도착했으면 중지
  if (norm < 1 && clickerIsOn) {
    if (clickerOption.track && clickerOption.queue.length !== 0) {
      const Q = clickerOption.queue.shift();
      if (Q instanceof THREE.Vector3) {
        const v = vec3(Q);
        const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
        
        // === 새로운 시스템 업데이트 ===
        if (setMouseInput) {
          setMouseInput({
            target: Q,
            angle: newAngle,
          });
        }
        
      } else {
        const { action, beforeCB, afterCB, time } = Q;
        if (action === "stop") {
          state.clock.stop();
          beforeCB(state);
          setTimeout(() => {
            state.clock.start();
            afterCB(state);
          }, time);
        }
      }
      if (clickerOption.loop) {
        clickerOption.queue.push(Q);
      }
    } else {
      // === 클리커 자동 정지 ===
      if (setMouseInput) {
        setMouseInput({
          isActive: false,
          shouldRun: false,
        });
      }
    }
  }
}

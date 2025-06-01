import { vec3 } from "@react-three/rapier";
import * as THREE from "three";
import { calcNorm } from "../../utils";
import { calcType } from "../type";

export default function queue(prop: calcType) {
  const {
    rigidBodyRef,
    state,
    worldContext: { clicker, mode, clickerOption, block },
    dispatch,
  } = prop;
  const u = vec3(rigidBodyRef.current?.translation());

  let norm = calcNorm(u, clicker.point, false);
  if (clickerOption.autoStart) {
    if (clickerOption.queue[0] instanceof THREE.Vector3) {
      const v = vec3(clickerOption.queue[0]);
      const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
      dispatch({
        type: "update",
        payload: {
          clicker: {
            ...clicker,
            isOn: true,
            angle: newAngle,
          },
        },
      });
      norm = calcNorm(u, clickerOption.queue[0], false);
    }
  }
  
  // 하이브리드 모드: 클리커가 활성화되어 있고 목적지에 도착했으면 중지
  if (norm < 1 && clicker.isOn) {
    if (clickerOption.track && clickerOption.queue.length !== 0) {
      const Q = clickerOption.queue.shift();
      if (Q instanceof THREE.Vector3) {
        const v = vec3(Q);
        const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
        dispatch({
          type: "update",
          payload: {
            clicker: {
              ...clicker,
              point: Q,
              angle: newAngle,
            },
          },
        });
      } else {
        const { action, beforeCB, afterCB, time } = Q;
        if (action === "stop") {
          state.clock.stop();
          beforeCB(state);
          console.log();
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
      dispatch({
        type: "update",
        payload: {
          clicker: {
            ...clicker,
            isOn: false,
            isRun: false,
          },
        },
      });
    }
  }
}

import { vec3 } from "@react-three/rapier";
import * as THREE from "three";
import { calcNorm } from "../../utils";
export default function queue(prop) {
    var _a;
    const { rigidBodyRef, state, worldContext: { clicker, mode, clickerOption, block }, } = prop;
    const u = vec3((_a = rigidBodyRef.current) === null || _a === void 0 ? void 0 : _a.translation());
    let norm = calcNorm(u, clicker.point, false);
    if (clickerOption.autoStart) {
        if (clickerOption.queue[0] instanceof THREE.Vector3) {
            clicker.isOn = true;
            norm = calcNorm(u, clickerOption.queue[0], false);
            const v = vec3(clickerOption.queue[0]);
            const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
            clicker.angle = newAngle;
        }
    }
    if (norm < 1 && mode.controller === "clicker") {
        if (clickerOption.track && clickerOption.queue.length !== 0) {
            const Q = clickerOption.queue.shift();
            if (Q instanceof THREE.Vector3) {
                clicker.point = Q;
                const v = vec3(clicker.point);
                const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
                clicker.angle = newAngle;
            }
            else {
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
        }
        else {
            clicker.isOn = false;
            clicker.isRun = false;
        }
    }
}

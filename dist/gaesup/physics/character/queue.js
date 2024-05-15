import { vec3 } from "@react-three/rapier";
import * as THREE from "three";
import { calcNorm } from "../../utils";
export default function queue(prop) {
    var _a;
    var rigidBodyRef = prop.rigidBodyRef, state = prop.state, _b = prop.worldContext, clicker = _b.clicker, mode = _b.mode, clickerOption = _b.clickerOption;
    var u = vec3((_a = rigidBodyRef.current) === null || _a === void 0 ? void 0 : _a.translation());
    var norm = calcNorm(u, clicker.point, false);
    if (clickerOption.autoStart) {
        if (clickerOption.queue[0] instanceof THREE.Vector3) {
            clicker.isOn = true;
            norm = calcNorm(u, clickerOption.queue[0], false);
            var v = vec3(clickerOption.queue[0]);
            var newAngle = Math.atan2(v.z - u.z, v.x - u.x);
            clicker.angle = newAngle;
        }
    }
    if (norm < 1 && mode.controller === "clicker") {
        if (clickerOption.track && clickerOption.queue.length !== 0) {
            var Q = clickerOption.queue.shift();
            if (Q instanceof THREE.Vector3) {
                clicker.point = Q;
                var v = vec3(clicker.point);
                var newAngle = Math.atan2(v.z - u.z, v.x - u.x);
                clicker.angle = newAngle;
            }
            else {
                Q();
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

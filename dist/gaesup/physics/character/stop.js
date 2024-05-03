import { vec3 } from "@react-three/rapier";
import { calcNorm } from "../../utils";
export default function stop(prop) {
    var _a;
    var rigidBodyRef = prop.rigidBodyRef, _b = prop.worldContext, control = _b.control, clicker = _b.clicker, mode = _b.mode, clickerOption = _b.clickerOption, activeState = _b.activeState;
    var keyS = control.keyS;
    if (keyS && mode.controller === "clicker") {
        clicker.isOn = false;
        clicker.isRun = false;
    }
    // 목적지 도착 (클리커 막기 로직)
    var u = vec3((_a = rigidBodyRef.current) === null || _a === void 0 ? void 0 : _a.translation());
    var norm = calcNorm(u, clicker.point, false);
    if (norm < 1 && mode.controller === "clicker") {
        if (clickerOption.track && clickerOption.queue.length !== 0) {
            clicker.point = clickerOption.queue.shift();
            var v = vec3(clicker.point);
            var newAngle = Math.atan2(v.z - u.z, v.x - u.x);
            clicker.angle = newAngle;
            if (clickerOption.loop) {
                clickerOption.queue.push(clicker.point);
            }
        }
        else {
            clicker.isOn = false;
            clicker.isRun = false;
        }
    }
}

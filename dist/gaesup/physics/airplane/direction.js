import { quat } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
export default function direction(prop) {
    var innerGroupRef = prop.innerGroupRef, _a = prop.worldContext, joystick = _a.joystick, activeState = _a.activeState, control = _a.control, mode = _a.mode, airplane = prop.controllerContext.airplane, matchSizes = prop.matchSizes;
    var forward = control.forward, backward = control.backward, leftward = control.leftward, rightward = control.rightward, shift = control.shift, space = control.space;
    var angleDelta = airplane.angleDelta, maxAngle = airplane.maxAngle, accelRatio = airplane.accelRatio;
    if (!matchSizes || !matchSizes["airplaneUrl"])
        return null;
    var boost = 0;
    if (mode.controller === "joystick") {
        boost = space
            ? Number(joystick.joyStickOrigin.isOn)
            : Number(joystick.joyStickOrigin.isOn) * accelRatio;
    }
    else {
        boost = space ? Number(shift) : Number(shift) * accelRatio;
    }
    var upDown = mode.controller === "joystick"
        ? joystick.joyStickOrigin.isUp
            ? -1
            : 1
        : Number(backward) - Number(forward);
    var leftRight = Number(rightward) - Number(leftward);
    var front = V3().set(boost, boost, boost);
    var _euler = activeState.euler.clone();
    var __euler = activeState.euler.clone();
    if (mode.controller === "joystick") {
        __euler.y = -Math.PI / 2 + joystick.joyStickOrigin.angle;
        activeState.euler.setFromQuaternion(quat().setFromEuler(_euler).slerp(quat().setFromEuler(__euler), 1));
    }
    else {
        activeState.euler.y += -leftRight * angleDelta.y;
    }
    var X = maxAngle.x * upDown;
    var Z = maxAngle.z * leftRight;
    var _x = innerGroupRef.current.rotation.x;
    var _z = innerGroupRef.current.rotation.z;
    var maxX = maxAngle.x;
    var maxZ = maxAngle.z;
    var innerGrounRefRotation = innerGroupRef.current.clone();
    if (_x < -maxX) {
        innerGrounRefRotation.rotation.x = -maxX + X;
    }
    else if (_x > maxX) {
        innerGrounRefRotation.rotation.x = maxX + X;
    }
    else {
        innerGrounRefRotation.rotateX(X);
    }
    if (_z < -maxZ)
        innerGrounRefRotation.rotation.z = -maxZ + Z;
    else if (_z > maxZ)
        innerGrounRefRotation.rotation.z = maxZ + Z;
    else
        innerGrounRefRotation.rotateZ(Z);
    activeState.euler.x = innerGrounRefRotation.rotation.x;
    activeState.euler.z = innerGrounRefRotation.rotation.z;
    innerGrounRefRotation.rotation.y = 0;
    innerGroupRef.current.setRotationFromQuaternion(quat()
        .setFromEuler(innerGroupRef.current.rotation.clone())
        .slerp(quat().setFromEuler(innerGrounRefRotation.rotation.clone()), 0.2));
    activeState.rotation = innerGrounRefRotation.rotation;
    activeState.direction = front.multiply(V3(Math.sin(activeState.euler.y), -upDown, Math.cos(activeState.euler.y)));
    activeState.dir = activeState.direction.normalize();
}

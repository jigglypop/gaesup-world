import { quat } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
export default function direction(prop) {
    var state = prop.state, innerGroupRef = prop.innerGroupRef, _a = prop.worldContext, joystick = _a.joystick, activeState = _a.activeState, control = _a.control, mode = _a.mode, airplane = prop.controllerContext.airplane;
    var forward = control.forward, backward = control.backward, leftward = control.leftward, rightward = control.rightward, shift = control.shift, space = control.space;
    var angleDelta = airplane.angleDelta, maxAngle = airplane.maxAngle, accelRatio = airplane.accelRatio;
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
        __euler.y =
            -state.camera.rotation.y - joystick.joyStickOrigin.angle - Math.PI / 2;
    }
    else {
        activeState.euler.y += -leftRight * angleDelta.y;
    }
    if (mode.controller === "joystick")
        activeState.euler.setFromQuaternion(quat()
            .setFromEuler(_euler)
            .slerp(quat().setFromEuler(__euler), joystick.joyStickOrigin.isIn ? 0.01 : 0.1));
    var X = maxAngle.x * upDown;
    var Z = maxAngle.z * leftRight;
    var _x = innerGroupRef.current.rotation.x;
    var _z = innerGroupRef.current.rotation.z;
    var maxX = maxAngle.x;
    var maxZ = maxAngle.z;
    var innerGrounRefRotation = innerGroupRef.current.clone();
    if (_x < -maxX)
        innerGrounRefRotation.rotation.x = -maxX + X;
    else if (_x > maxX)
        innerGrounRefRotation.rotation.x = maxX + X;
    else
        innerGrounRefRotation.rotateX(X);
    if (_z < -maxZ)
        innerGrounRefRotation.rotation.z = -maxZ + Z;
    else if (_z > maxZ)
        innerGrounRefRotation.rotation.z = maxZ + Z;
    else
        innerGrounRefRotation.rotateZ(Z);
    innerGroupRef.current.setRotationFromQuaternion(quat()
        .setFromEuler(innerGroupRef.current.rotation.clone())
        .slerp(quat().setFromEuler(innerGrounRefRotation.rotation), 0.1));
    activeState.direction = front.multiply(V3(Math.sin(activeState.euler.y), -upDown, Math.cos(activeState.euler.y)));
    activeState.dir = activeState.direction.normalize();
}

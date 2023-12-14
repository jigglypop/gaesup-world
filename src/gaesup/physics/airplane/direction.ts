import { quat } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
import { calcPropType } from "../type";

export default function direction(prop: calcPropType) {
  const {
    state,
    innerGroupRef,
    worldContext: { joystick, activeState, control, mode },
    controllerContext: { airplane },
  } = prop;
  const { forward, backward, leftward, rightward, shift, space } = control;
  const { angleChange, maxAngle, accelRatio } = airplane;

  let boost = 0;
  if (mode.controller === "joystick") {
    boost = space
      ? Number(joystick.joyStickOrigin.isOn)
      : Number(joystick.joyStickOrigin.isOn) * accelRatio;
  } else {
    boost = space ? Number(shift) : Number(shift) * accelRatio;
  }
  const upDown =
    mode.controller === "joystick"
      ? joystick.joyStickOrigin.isUp
        ? -1
        : 1
      : Number(backward) - Number(forward);
  const leftRight = Number(rightward) - Number(leftward);
  const front = V3().set(boost, boost, boost);

  const _euler = activeState.euler.clone();
  const __euler = activeState.euler.clone();
  if (mode.controller === "joystick") {
    __euler.y =
      -state.camera.rotation.y - joystick.joyStickOrigin.angle - Math.PI / 2;
  } else {
    activeState.euler.y += -leftRight * angleChange.y;
  }
  if (mode.controller === "joystick")
    activeState.euler.setFromQuaternion(
      quat()
        .setFromEuler(_euler)
        .slerp(
          quat().setFromEuler(__euler),
          joystick.joyStickOrigin.isIn ? 0.01 : 0.1
        )
    );

  const X = maxAngle.x * upDown;
  const Z = maxAngle.z * leftRight;

  const _x = innerGroupRef.current.rotation.x;
  const _z = innerGroupRef.current.rotation.z;

  const maxX = maxAngle.x;
  const maxZ = maxAngle.z;

  const innerGrounRefRotation = innerGroupRef.current.clone();

  if (_x < -maxX) innerGrounRefRotation.rotation.x = -maxX + X;
  else if (_x > maxX) innerGrounRefRotation.rotation.x = maxX + X;
  else innerGrounRefRotation.rotateX(X);

  if (_z < -maxZ) innerGrounRefRotation.rotation.z = -maxZ + Z;
  else if (_z > maxZ) innerGrounRefRotation.rotation.z = maxZ + Z;
  else innerGrounRefRotation.rotateZ(Z);

  innerGroupRef.current.setRotationFromQuaternion(
    quat()
      .setFromEuler(innerGroupRef.current.rotation.clone())
      .slerp(quat().setFromEuler(innerGrounRefRotation.rotation), 0.1)
  );

  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), -upDown, Math.cos(activeState.euler.y))
  );
  activeState.dir = activeState.direction.normalize();
}

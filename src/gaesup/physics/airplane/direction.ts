import { quat } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
import { calcPropType } from "../type";

export default function direction(prop: calcPropType) {
  const {
    innerGroupRef,
    rigidBodyRef,
    worldContext: { joystick, activeState, control, mode },
    controllerContext: { airplane },
    matchSizes,
  } = prop;
  const { forward, backward, leftward, rightward, shift, space } = control;
  const { angleDelta, maxAngle, accelRatio } = airplane;
  if (!matchSizes || !matchSizes["airplaneUrl"]) return null;

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
    __euler.y = -Math.PI / 2 + joystick.joyStickOrigin.angle;
    activeState.euler.setFromQuaternion(
      quat().setFromEuler(_euler).slerp(quat().setFromEuler(__euler), 1)
    );
  } else {
    activeState.euler.y += -leftRight * angleDelta.y;
  }

  const X = maxAngle.x * upDown;
  const Z = maxAngle.z * leftRight;

  const _x = innerGroupRef.current.rotation.x;
  const _z = innerGroupRef.current.rotation.z;

  const maxX = maxAngle.x;
  const maxZ = maxAngle.z;

  const innerGrounRefRotation = innerGroupRef.current.clone();

  if (_x < -maxX) {
    innerGrounRefRotation.rotation.x = -maxX + X;
  } else if (_x > maxX) {
    innerGrounRefRotation.rotation.x = maxX + X;
  } else {
    innerGrounRefRotation.rotateX(X);
  }

  if (_z < -maxZ) innerGrounRefRotation.rotation.z = -maxZ + Z;
  else if (_z > maxZ) innerGrounRefRotation.rotation.z = maxZ + Z;
  else innerGrounRefRotation.rotateZ(Z);
  activeState.euler.x = innerGrounRefRotation.rotation.x;
  activeState.euler.z = innerGrounRefRotation.rotation.z;

  innerGrounRefRotation.rotation.y = 0;
  innerGroupRef.current.setRotationFromQuaternion(
    quat()
      .setFromEuler(innerGroupRef.current.rotation.clone())
      .slerp(quat().setFromEuler(innerGrounRefRotation.rotation.clone()), 0.2)
  );

  activeState.rotation = innerGrounRefRotation.rotation;
  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), -upDown, Math.cos(activeState.euler.y))
  );
  activeState.dir = activeState.direction.normalize();
}

import * as THREE from "three";
import { calcPropType } from "../type";

export default function direction(prop: calcPropType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
  } = prop;
  const { forward, backward, leftward, rightward } = prop.control;
  const maxVelocity = 0.04;
  activeState.yaw *= 0.95;
  activeState.pitch *= 0.95;
  if (Math.abs(activeState.yaw) > maxVelocity)
    activeState.yaw = Math.sign(activeState.yaw) * maxVelocity;

  if (Math.abs(activeState.pitch) > maxVelocity)
    activeState.pitch = Math.sign(activeState.pitch) * maxVelocity;
  activeState.yaw += (Number(rightward) - Number(leftward)) * 0.0025;
  activeState.pitch += (Number(backward) - Number(forward)) * 0.0025;

  activeState.axisX.applyAxisAngle(activeState.axisZ, activeState.yaw);
  activeState.axisY.applyAxisAngle(activeState.axisX, activeState.pitch);
  activeState.axisY.applyAxisAngle(activeState.axisZ, activeState.yaw);
  activeState.axisZ.applyAxisAngle(activeState.axisX, activeState.pitch);
  activeState.axisX.normalize();
  activeState.axisY.normalize();
  activeState.axisZ.normalize();
  const rotMatrix = new THREE.Matrix4().makeBasis(
    activeState.axisX,
    activeState.axisY,
    activeState.axisZ
  );
  activeState.position.add(activeState.axisZ.clone().multiplyScalar(0.1));
  const matrix = new THREE.Matrix4()
    .multiply(
      new THREE.Matrix4().makeTranslation(
        activeState.position.x,
        activeState.position.y,
        activeState.position.z
      )
    )
    .multiply(rotMatrix);

  // rigidBodyRef.current.setTranslation(
  //   vec3().setFromMatrixPosition(matrix),
  //   true
  // );
  // rigidBodyRef.current.setRotation(
  //   new THREE.Quaternion().setFromRotationMatrix(matrix),
  //   true
  // );
}

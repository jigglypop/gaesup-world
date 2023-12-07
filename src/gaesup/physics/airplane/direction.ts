import { vec3 } from "@react-three/rapier";
import * as THREE from "three";
import { calcPropType } from "..";

export default function direction(prop: calcPropType) {
  const [current] = prop.current;
  const { rigidBodyRef } = prop;
  const { forward, backward, leftward, rightward } = prop.control;
  const maxVelocity = 0.04;
  current.yaw *= 0.95;
  current.pitch *= 0.95;
  if (Math.abs(current.yaw) > maxVelocity)
    current.yaw = Math.sign(current.yaw) * maxVelocity;

  if (Math.abs(current.pitch) > maxVelocity)
    current.pitch = Math.sign(current.pitch) * maxVelocity;
  current.yaw += (Number(rightward) - Number(leftward)) * 0.0025;
  current.pitch += (Number(backward) - Number(forward)) * 0.0025;

  current.axisX.applyAxisAngle(current.axisZ, current.yaw);
  current.axisY.applyAxisAngle(current.axisX, current.pitch);
  current.axisY.applyAxisAngle(current.axisZ, current.yaw);
  current.axisZ.applyAxisAngle(current.axisX, current.pitch);
  current.axisX.normalize();
  current.axisY.normalize();
  current.axisZ.normalize();
  const rotMatrix = new THREE.Matrix4().makeBasis(
    current.axisX,
    current.axisY,
    current.axisZ
  );
  current.position.add(current.axisZ.clone().multiplyScalar(0.1));
  const matrix = new THREE.Matrix4()
    .multiply(
      new THREE.Matrix4().makeTranslation(
        current.position.x,
        current.position.y,
        current.position.z
      )
    )
    .multiply(rotMatrix);

  rigidBodyRef.current.setTranslation(
    vec3().setFromMatrixPosition(matrix),
    true
  );
  rigidBodyRef.current.setRotation(
    new THREE.Quaternion().setFromRotationMatrix(matrix),
    true
  );
}

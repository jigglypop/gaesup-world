import { vec3 } from "@react-three/rapier";
import * as THREE from "three";
import { calcPropType } from "..";

export default function direction(prop: calcPropType) {
  const [current] = prop.current;
  const { rigidBodyRef, outerGroupRef } = prop;
  const { forward, backward, leftward, rightward } = prop.control;
  const maxVelocity = 0.04;
  current.yaw *= 0.95;
  current.pitch *= 0.95;
  if (Math.abs(current.yaw) > maxVelocity)
    current.yaw = Math.sign(current.yaw) * maxVelocity;

  if (Math.abs(current.pitch) > maxVelocity)
    current.pitch = Math.sign(current.pitch) * maxVelocity;
  current.yaw += ((Number(rightward) - Number(leftward)) * Math.PI) / 256;
  current.pitch += ((Number(backward) - Number(forward)) * Math.PI) / 256;

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

  // outerGroupRef.current.matrixAutoUpdate = false;
  // outerGroupRef.current.matrix.copy(matrix);
  // outerGroupRef.current.matrixWorldNeedsUpdate = true;
  rigidBodyRef.current.setTranslation(
    vec3().setFromMatrixPosition(matrix),
    false
  );
  rigidBodyRef.current.setRotation(
    new THREE.Quaternion().setFromRotationMatrix(matrix),
    false
  );
  // outerGroupRef.current.matrixAutoUpdate = false;
  // outerGroupRef.current.matrix.copy(matrix);
  // outerGroupRef.current.matrixWorldNeedsUpdate = true;
  //   current.direction = V31().multiply(current.dir).multiplyScalar(0.5);
}

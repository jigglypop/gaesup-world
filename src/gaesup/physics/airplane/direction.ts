import { V3 } from "@/gaesup/utils/vector";
import { vec3 } from "@react-three/rapier";
import * as THREE from "three";
import { calcPropType } from "..";

export default function direction(prop: calcPropType) {
  const [current] = prop.current;
  const { rigidBodyRef, outerGroupRef } = prop;
  const { forward, backward, leftward, rightward } = prop.control;
  current.euler.z += ((Number(rightward) - Number(leftward)) * Math.PI) / 128;
  current.euler.x += ((Number(backward) - Number(forward)) * Math.PI) / 128;

  // current.dir = V3(
  //   Math.cos(current.euler.z) * Math.cos(current.euler.y),
  //   Math.sin(current.euler.z) * Math.cos(current.euler.y),
  //   Math.sin(current.euler.y)
  // ).normalize();

  const position = V3(0, 2, 5);

  const matrix = new THREE.Matrix4().multiply(
    new THREE.Matrix4().makeTranslation(position.x, position.y, position.z)
  );

  rigidBodyRef.current.setTranslation(
    vec3().setFromMatrixPosition(matrix),
    false
  );
  // outerGroupRef.current.matrixAutoUpdate = false;
  // outerGroupRef.current.matrix.copy(matrix);
  // outerGroupRef.current.matrixWorldNeedsUpdate = true;
  //   current.direction = V31().multiply(current.dir).multiplyScalar(0.5);
}

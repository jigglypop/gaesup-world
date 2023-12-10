import { V3 } from "../../utils/vector";
import { calcPropType } from "../type";

export default function direction(prop: calcPropType) {
  const {
    rigidBodyRef,
    innerGroupRef,
    worldContext: { activeState },
  } = prop;
  const { forward, backward, leftward, rightward } = prop.control;

  const start = Number(forward) - Number(backward);
  const front = V3().set(start, start, start);
  activeState.euler.y += (Number(leftward) - Number(rightward)) / 64;

  const X = Math.PI * 0.01 * (Number(backward) - Number(forward));
  const Z = Math.PI * 0.005 * (Number(rightward) - Number(leftward));

  const _x = innerGroupRef.current.rotation.x;
  const _z = innerGroupRef.current.rotation.z;

  const maxX = Math.PI / 16;
  const maxZ = Math.PI / 64;

  if (_x < -maxX) innerGroupRef.current.rotation.x = -maxX + X;
  else if (_x > maxX) innerGroupRef.current.rotation.x = maxX - X;
  else innerGroupRef.current.rotateX(X);

  if (_z < -maxZ) innerGroupRef.current.rotation.z = -maxZ + Z;
  else if (_z > maxZ) innerGroupRef.current.rotation.z = maxZ - Z;
  else innerGroupRef.current.rotateZ(Z);

  // current.dir = V3(
  //   Math.sin(current.euler.y),
  //   0,
  //   Math.cos(current.euler.y)
  // ).normalize();
  // current.direction = front
  //   .multiply(current.dir)
  //   .multiplyScalar(shift ? accelRate : 1);
  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), 1, Math.cos(activeState.euler.y))
  );
  activeState.dir = activeState.direction.normalize();

  //   const pitch = Number(forward) - Number(backward);
  //   // const front = vec3().set(start, start * 1, start);
  //   const yaw = Number(leftward) - Number(rightward);
  //
  //   // activeState.euler.y += (side * Math.PI) / 64;
  //
  //   // if (euler.x > Math.PI / 16) euler.x = Math.PI / 16 - 0.005;
  //   // else if (euler.x < -Math.PI / 16) euler.x = -Math.PI / 16 + 0.005;
  //   // if (euler.z > Math.PI / 16) euler.z = Math.PI / 16 - 0.005;
  //   // else if (euler.z < -Math.PI / 16) euler.z = -Math.PI / 16 + 0.005;
  //   // if (euler.y > Math.PI / 4) euler.y = Math.PI / 4 - 0.005;
  //   // else if (euler.y < -Math.PI / 4) euler.y = -Math.PI / 4 + 0.005;
  //
  //   const delta = Math.PI * 0.005;
  //   euler.x += pitch * delta * Math.cos(euler.z) * Math.cos(euler.y);
  //   euler.z += -yaw * delta;
  //   euler.y += pitch * delta * Math.sin(euler.z) * Math.sin(euler.y);
  //
  //   // activeState.direction = front.multiply(
  //   //   V3(Math.sin(activeState.euler.y), 1, Math.cos(activeState.euler.y))
  //   // );
  //   // activeState.dir = activeState.direction.normalize();
}

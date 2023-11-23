// import { currentCameraAtom } from '@gaesup/stores/camera/atom';
import useCalcControl from '@gaesup/stores/control';
import { currentAtom } from '@gaesup/stores/current';
import { propType } from '@gaesup/type';
import { V3 } from '@gaesup/utils/vector';
import { useFrame } from '@react-three/fiber';
import { vec3 } from '@react-three/rapier';
import { useAtomValue } from 'jotai';

export default function vehicleDirection(prop: propType) {
  const { rigidBodyRef, outerGroupRef } = prop;
  const current = useAtomValue(currentAtom);
  const { forward, backward, leftward, rightward } = useCalcControl(prop);

  useFrame((state, delta) => {
    if (
      !rigidBodyRef ||
      !rigidBodyRef.current ||
      !outerGroupRef ||
      !outerGroupRef.current
    )
      return null;
    const start = Number(backward) - Number(forward);
    const front = vec3().set(start, 0, start);
    current.euler.y += ((Number(leftward) - Number(rightward)) * Math.PI) / 64;
    const dir = V3(
      Math.sin(current.euler.y),
      0,
      Math.cos(current.euler.y)
    ).normalize();
    const direction = vec3(front).multiply(dir).multiplyScalar(0.1);

    rigidBodyRef.current.applyImpulse(
      vec3({
        x: direction.x,
        y: 0,
        z: direction.z
      }),
      false
    );

    const _position = vec3(rigidBodyRef.current.translation());

    let cameraPosition = _position.clone().add(
      dir
        .clone()
        .multiplyScalar(8)
        .add(V3(0, 1, 0))
    );

    state.camera.position.lerp(cameraPosition, 0.2);
    state.camera.quaternion.copy(current.quat);
    state.camera.lookAt(_position);
  });
}

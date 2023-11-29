import { currentAtom } from "@gaesup/stores/current";
import { propType } from "@gaesup/type";
import { V3 } from "@gaesup/utils/vector";
import { useFrame } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import { useAtomValue } from "jotai";

export default function vehicleCamera(prop: propType) {
  const { rigidBodyRef, outerGroupRef } = prop;
  const current = useAtomValue(currentAtom);
  useFrame((state) => {
    if (
      !rigidBodyRef ||
      !rigidBodyRef.current ||
      !outerGroupRef ||
      !outerGroupRef.current
    )
      return null;
    const cameraPosition = vec3(rigidBodyRef.current.translation())
      .clone()
      .add(
        current.dir
          .clone()
          .multiplyScalar(8)
          .add(V3(0, 1, 0))
      );
    state.camera.position.lerp(cameraPosition, 1);
    state.camera.quaternion.copy(current.quat);
    state.camera.lookAt(vec3(rigidBodyRef.current.translation()));
  });
}

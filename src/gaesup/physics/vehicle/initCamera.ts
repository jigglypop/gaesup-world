import { optionsAtom } from "@/gaesup/stores/options";
import { V3 } from "@/gaesup/utils/vector";
import { currentAtom } from "@gaesup/stores/current";
import { propType } from "@gaesup/type";
import { useThree } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

export default function initCamera(prop: propType) {
  const options = useAtomValue(optionsAtom);
  const { rigidBodyRef } = prop;
  const current = useAtomValue(currentAtom);
  const { camera } = useThree();
  const { XZDistance, YDistance } = options.perspectiveCamera;

  useEffect(() => {
    if (rigidBodyRef.current) {
      const cameraPosition = vec3(rigidBodyRef.current.translation())
        .clone()
        .add(
          current.dir
            .clone()
            .multiplyScalar(XZDistance)
            .add(V3(0, YDistance, 0))
        );
      camera.position.lerp(cameraPosition, 1);
    }
  }, []);
}

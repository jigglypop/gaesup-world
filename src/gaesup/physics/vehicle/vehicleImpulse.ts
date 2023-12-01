import { currentAtom } from "@gaesup/stores/current";
import { propType, refsType } from "@gaesup/type";
import { useFrame } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import { useSetAtom } from "jotai";

export default function vehicleImpulse(prop: propType, refs: refsType) {
  const setCurrent = useSetAtom(currentAtom);
  const { rigidBodyRef } = prop;
  useFrame(() => {
    // if (!jointRefs || !jointRefs.current) return null;

    setCurrent((current) => ({
      ...current,
      position: vec3(rigidBodyRef.current!.translation()),
      velocity: vec3(rigidBodyRef.current!.linvel()),
    }));

  });
}

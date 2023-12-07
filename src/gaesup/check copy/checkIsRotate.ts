import { useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { currentAtom } from "../stores/current";
import { statesAtom } from "../stores/states";
import { propType } from "../type";

export default function checkIsRotate(prop: propType) {
  const states = useAtomValue(statesAtom);
  const { outerGroupRef } = prop;
  const current = useAtomValue(currentAtom);

  useFrame(() => {
    if (states.isMoving && outerGroupRef && outerGroupRef.current) {
      states.isRotated =
        Math.sin(outerGroupRef.current.rotation.y).toFixed(3) ===
        Math.sin(current.euler.y).toFixed(3);
    }
  });
}

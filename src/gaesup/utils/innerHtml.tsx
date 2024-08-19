import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

export function InnerHtml({ children, ...props }) {
  const ref = useRef<THREE.Group>();
  const [isInRange, setInRange] = useState<boolean>();
  const vec = new THREE.Vector3();
  useFrame((state) => {
    const range =
      state.camera.position.distanceTo(ref.current.getWorldPosition(vec)) <= 10;
    if (range !== isInRange) setInRange(range);
  });
  return (
    <group ref={ref}>
      <Html transform occlude {...props}>
        {children}
      </Html>
    </group>
  );
}

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PointerProps {
  color?: string;
}

export default function Pointer({ color = "#ffffff" }: PointerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      meshRef.current.position.y = Math.sin(t * 2) * 0.2;
      meshRef.current.rotation.y = t;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <coneGeometry args={[0.2, 0.8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
} 
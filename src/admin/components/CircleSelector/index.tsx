import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CircleSelectorProps {
  radius?: number;
  color?: string;
  segments?: number;
}

export default function CircleSelector({ 
  radius = 2, 
  color = "white", 
  segments = 64 
}: CircleSelectorProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      const scale = 0.9 + Math.sin(t * 2) * 0.1;
      meshRef.current.scale.set(scale, scale, 1);
      if (meshRef.current.material && meshRef.current.material instanceof THREE.Material) {
        meshRef.current.material.opacity = 0.3 + Math.sin(t * 2) * 0.1;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, segments]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
} 
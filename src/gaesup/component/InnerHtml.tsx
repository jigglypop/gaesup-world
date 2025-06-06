import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

export function InnerHtml({ children, distance = 10, throttle = 100, ...props }) {
  const ref = useRef<THREE.Group>();
  const [isInRange, setInRange] = useState<boolean>();
  const vecRef = useRef(new THREE.Vector3());
  const lastCheckRef = useRef(0);
  useFrame((state) => {
    const now = state.clock.elapsedTime * 1000;
    if (now - lastCheckRef.current < throttle) return;
    lastCheckRef.current = now;
    const vec = vecRef.current;
    const range = state.camera.position.distanceTo(ref.current.getWorldPosition(vec)) <= distance;
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

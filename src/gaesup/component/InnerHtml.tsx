import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ReactNode, useRef, useState } from 'react';
import * as THREE from 'three';

interface InnerHtmlProps {
  distance?: number;
  throttle?: number;
  children: ReactNode;
  [key: string]: any;
}

export function InnerHtml({ children, distance = 10, throttle = 100, ...props }: InnerHtmlProps) {
  const ref = useRef<THREE.Group>(null);
  const [isInRange, setInRange] = useState<boolean>(true);
  const vecRef = useRef(new THREE.Vector3());
  const lastCheckRef = useRef(0);
  useFrame((state) => {
    const now = state.clock.elapsedTime * 1000;
    if (now - lastCheckRef.current < throttle) return;
    lastCheckRef.current = now;
    if (ref.current) {
      const vec = vecRef.current;
      const range = state.camera.position.distanceTo(ref.current.getWorldPosition(vec)) <= distance;
      if (range !== isInRange) setInRange(range);
    }
  });
  return (
    <group ref={ref}>
      <Html transform occlude {...props}>
        {children}
      </Html>
    </group>
  );
}

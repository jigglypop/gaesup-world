import React, { memo } from 'react';
import * as THREE from 'three';

export const TargetMarker = memo(() => (
  <group>
    <mesh>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial
        color="#00ff88"
        emissive="#00ff88"
        emissiveIntensity={0.5}
        transparent
        opacity={0.9}
      />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.5, 8]} />
      <meshStandardMaterial
        color="#00ff88"
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  </group>
)); 
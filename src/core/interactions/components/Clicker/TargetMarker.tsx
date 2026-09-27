import { memo } from 'react';

import * as THREE from 'three';

/** A ring on the ground at the destination, drawn over the grass, and a bead above it. */
export const TargetMarker = memo(() => (
  <group>
    <mesh position={[0, 0.35, 0]}>
      <sphereGeometry args={[0.16, 16, 16]} />
      <meshStandardMaterial
        color="#00ff88"
        emissive="#00ff88"
        emissiveIntensity={0.5}
        transparent
        opacity={0.9}
      />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} renderOrder={2}>
      <ringGeometry args={[0.3, 0.5, 32]} />
      <meshBasicMaterial
        color="#00ff88"
        transparent
        opacity={0.75}
        depthTest={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  </group>
));

TargetMarker.displayName = 'TargetMarker';
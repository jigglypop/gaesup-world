import React, { memo } from 'react';

import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface PathLineProps {
  points: THREE.Vector3[];
  color: string;
}

export const PathLine = memo(({ points, color }: PathLineProps) => {
  if (points.length < 2) return null;
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      dashed={false}
    />
  );
}); 
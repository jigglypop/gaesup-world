import { RefObject, useEffect, useMemo, useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib';

const MAX_POINTS = 128;
const UPDATE_INTERVAL_MS = 100;

export type PathLineProps = {
  pointsRef: RefObject<THREE.Vector3[]>;
  color: string;
};

export function PathLine({ pointsRef, color }: PathLineProps) {
  const size = useThree((state) => state.size);
  const lastUpdateRef = useRef(0);
  const positionsRef = useRef(new Array<number>(MAX_POINTS * 3).fill(0));

  const line = useMemo(() => {
    const geometry = new LineGeometry();
    geometry.setPositions(new Array<number>(MAX_POINTS * 3).fill(0));
    const material = new LineMaterial({
      color: new THREE.Color(color).getHex(),
      linewidth: 2,
      transparent: true,
      opacity: 0.9,
    });
    const instance = new Line2(geometry, material);
    instance.visible = false;
    instance.frustumCulled = false;
    return instance;
  }, []);

  useEffect(() => {
    const material = line.material as LineMaterial;
    material.resolution.set(size.width, size.height);
  }, [line, size.width, size.height]);

  useEffect(() => {
    const material = line.material as LineMaterial;
    material.color.set(color);
  }, [line, color]);

  useEffect(() => {
    return () => {
      line.geometry.dispose();
      (line.material as LineMaterial).dispose();
    };
  }, [line]);

  useFrame(() => {
    const now = performance.now();
    if (now - lastUpdateRef.current < UPDATE_INTERVAL_MS) return;
    lastUpdateRef.current = now;
    const points = pointsRef.current;
    if (!points || points.length < 2) {
      line.visible = false;
      return;
    }
    const count = Math.min(points.length, MAX_POINTS);
    const positions = positionsRef.current;
    for (let index = 0; index < count; index += 1) {
      const point = points[index];
      if (!point) continue;
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    }
    line.geometry.setPositions(positions.slice(0, count * 3));
    line.computeLineDistances();
    line.visible = true;
  });

  return <primitive object={line} />;
}

PathLine.displayName = 'PathLine';

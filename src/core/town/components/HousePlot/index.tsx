import React, { useEffect, useMemo } from 'react';

import * as THREE from 'three';

import { useTownStore } from '../../stores/townStore';

export type HousePlotProps = {
  id: string;
  position: [number, number, number];
  size?: [number, number];
  emptyColor?: string;
  reservedColor?: string;
  occupiedColor?: string;
};

export function HousePlot({
  id,
  position,
  size = [4, 4],
  emptyColor = '#705038',
  reservedColor = '#c8a85a',
  occupiedColor = '#5a8acf',
}: HousePlotProps) {
  const registerHouse = useTownStore((s) => s.registerHouse);
  const unregisterHouse = useTownStore((s) => s.unregisterHouse);
  const house = useTownStore((s) => s.houses[id]);
  const residents = useTownStore((s) => s.residents);

  useEffect(() => {
    registerHouse({ id, position, size });
    return () => unregisterHouse(id);
  }, [id, position, size, registerHouse, unregisterHouse]);

  const color = !house ? emptyColor
    : house.state === 'occupied' ? occupiedColor
    : house.state === 'reserved' ? reservedColor
    : emptyColor;

  const resident = house?.residentId ? residents[house.residentId] : null;

  const geom = useMemo(() => new THREE.PlaneGeometry(size[0], size[1]), [size[0], size[1]]);

  return (
    <group position={position}>
      <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <meshToonMaterial color={color} transparent opacity={0.7} />
      </mesh>

      {house?.state === 'occupied' && resident && (
        <>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[Math.max(1.4, size[0] * 0.6), 1.2, Math.max(1.4, size[1] * 0.6)]} />
            <meshToonMaterial color={resident.bodyColor ?? '#e8d8b8'} />
          </mesh>
          <mesh position={[0, 1.5, 0]} castShadow>
            <coneGeometry args={[Math.max(1.0, size[0] * 0.45), 0.7, 4]} />
            <meshToonMaterial color={resident.hatColor ?? '#a85a5a'} />
          </mesh>
        </>
      )}

      {house?.state === 'reserved' && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.4, 1.0, 0.4]} />
          <meshToonMaterial color={reservedColor} />
        </mesh>
      )}
    </group>
  );
}

export default HousePlot;

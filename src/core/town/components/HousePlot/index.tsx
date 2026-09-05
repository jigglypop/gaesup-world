import { useEffect } from 'react';

import { useTownStore } from '../../stores/townStore';

export type HousePlotProps = {
  id: string;
  position: [number, number, number];
  size?: [number, number];
  emptyColor?: string;
  reservedColor?: string;
  occupiedColor?: string;
};

const DEFAULT_SIZE: [number, number] = [4, 4];

export function HousePlot({
  id,
  position,
  size = DEFAULT_SIZE,
  emptyColor = '#705038',
  reservedColor = '#c8a85a',
  occupiedColor = '#5a8acf',
}: HousePlotProps) {
  const registerHouse = useTownStore((s) => s.registerHouse);
  const house = useTownStore((s) => s.houses[id]);
  const resident = useTownStore((s) => house?.residentId ? s.residents[house.residentId] : undefined);

  useEffect(() => {
    registerHouse({ id, position, size });
  }, [id, position, size, registerHouse]);

  if (!house) return null;

  const color = house.state === 'occupied' ? occupiedColor
    : house.state === 'reserved' ? reservedColor
    : emptyColor;

  const [width, depth] = house.size;

  return (
    <group position={house.position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshToonMaterial color={color} transparent opacity={0.7} />
      </mesh>

      {house?.state === 'occupied' && resident && (
        <>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[Math.max(1.4, width * 0.6), 1.2, Math.max(1.4, depth * 0.6)]} />
            <meshToonMaterial color={resident.bodyColor ?? '#e8d8b8'} />
          </mesh>
          <mesh position={[0, 1.5, 0]} castShadow>
            <coneGeometry args={[Math.max(1.0, width * 0.45), 0.7, 4]} />
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

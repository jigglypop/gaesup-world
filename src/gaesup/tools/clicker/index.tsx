import { Line } from '@react-three/drei';
import { ReactNode, useContext } from 'react';
import * as THREE from 'three';
import { GaesupWorldContext } from '../../world/context';

export function Clicker({ onMarker, runMarker }: { onMarker: ReactNode; runMarker: ReactNode }) {
  const { clicker, mode, clickerOption } = useContext(GaesupWorldContext);
  const pointQ = [];
  for (let i = 0; i < clickerOption.queue.length; i++) {
    if (clickerOption.queue[i] instanceof THREE.Vector3) {
      pointQ.push(clickerOption.queue[i]);
    }
  }

  return (
    <>
      {/* 하이브리드 모드: 항상 클리커 마커 표시 */}
      <group position={clicker.point}>
        {clicker.isOn && onMarker}
        {clicker.isOn && clickerOption.isRun && clicker.isRun && runMarker}
      </group>
      {clickerOption.line &&
        pointQ.map((queueItem, key) => {
          if (queueItem instanceof THREE.Vector3) {
            const current = key;
            const before = key === 0 ? pointQ.length - 1 : key - 1;

            return (
              <group position={[0, 1, 0]} key={key}>
                <Line
                  worldUnits
                  points={[pointQ[before], pointQ[current]]}
                  color="turquoise"
                  transparent
                  opacity={0.5}
                  lineWidth={0.4}
                />

                <mesh key={key} position={queueItem}>
                  <sphereGeometry args={[0.6, 30, 0.6]} />
                  <meshStandardMaterial color="turquoise" transparent opacity={0.8} />
                </mesh>
              </group>
            );
          }
        })}
    </>
  );
}

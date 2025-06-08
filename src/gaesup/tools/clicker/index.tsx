import { Line } from '@react-three/drei';
import { useSnapshot } from 'valtio';
import { memo } from 'react';
import * as THREE from 'three';
import { gameStore } from '../../store/gameStore';

const OnMarker = memo(() => (
  <mesh>
    <sphereGeometry args={[0.3, 16, 16]} />
    <meshStandardMaterial color="red" transparent opacity={0.8} />
  </mesh>
));

const RunMarker = memo(() => (
  <mesh>
    <sphereGeometry args={[0.4, 16, 16]} />
    <meshStandardMaterial color="orange" transparent opacity={0.8} />
  </mesh>
));

export const Clicker = memo(() => {
  const inputSystem = useSnapshot(gameStore.input);
  const pointer = inputSystem.pointer;
  const clickerOption = inputSystem.clickerOption;
  const pointQ = [];
  for (let i = 0; i < clickerOption.queue.length; i++) {
    if (clickerOption.queue[i] instanceof THREE.Vector3) {
      pointQ.push(clickerOption.queue[i]);
    }
  }
  return (
    <>
      <group position={pointer.target}>
        {pointer.isActive && <OnMarker />}
        {pointer.isActive && clickerOption.isRun && pointer.shouldRun && <RunMarker />}
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
});

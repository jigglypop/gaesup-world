import { Line } from '@react-three/drei';
import { memo } from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '@stores/gaesupStore';

const TargetMarker = memo(() => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.5, 0.05, 8, 16]} />
      <meshStandardMaterial
        color="#00ff88"
        transparent
        opacity={0.8}
        emissive="#004422"
        emissiveIntensity={0.3}
      />
    </mesh>
    <mesh>
      <sphereGeometry args={[0.15, 12, 12]} />
      <meshStandardMaterial
        color="#00ff88"
        transparent
        opacity={0.9}
        emissive="#00ff88"
        emissiveIntensity={0.2}
      />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.7, 0.02, 6, 12]} />
      <meshStandardMaterial
        color="#00ff88"
        transparent
        opacity={0.4}
        emissive="#00ff88"
        emissiveIntensity={0.1}
      />
    </mesh>
  </group>
));

const RunModeMarker = memo(() => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.8, 0.08, 8, 20]} />
      <meshStandardMaterial
        color="#ff6600"
        transparent
        opacity={0.7}
        emissive="#ff3300"
        emissiveIntensity={0.4}
      />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.6, 0.06, 8, 16]} />
      <meshStandardMaterial
        color="#ffaa00"
        transparent
        opacity={0.8}
        emissive="#ff6600"
        emissiveIntensity={0.3}
      />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.0, 0.03, 6, 12]} />
      <meshStandardMaterial
        color="#ff6600"
        transparent
        opacity={0.3}
        emissive="#ff6600"
        emissiveIntensity={0.2}
      />
    </mesh>
  </group>
));
const QueuePointMarker = memo(({ position }: { position: THREE.Vector3 }) => (
  <mesh position={position}>
    <octahedronGeometry args={[0.4, 0]} />
    <meshStandardMaterial
      color="#00dddd"
      transparent
      opacity={0.85}
      emissive="#006666"
      emissiveIntensity={0.3}
      metalness={0.1}
      roughness={0.3}
    />
  </mesh>
));

export const Clicker = memo(() => {
  const mouse = useGaesupStore((state) => state.interaction?.mouse);
  const automation = useGaesupStore((state) => state.automation);

  if (!mouse || !automation) return null;

  const pointQueue = automation.queue.actions
    .filter(action => action.type === 'move' || action.type === 'click')
    .map(action => action.target)
    .filter((target): target is THREE.Vector3 => target instanceof THREE.Vector3);

  return (
    <>
      <group position={mouse.target}>
        {mouse.isActive && <TargetMarker />}
        {mouse.isActive && automation.queue.isRunning && mouse.shouldRun && <RunModeMarker />}
      </group>
      {automation.settings.showVisualCues && pointQueue.length > 0 && (
        <group position={[0, 0.1, 0]}>
          {pointQueue.map((queueItem, index) => {
            const current = index;
            const before = index === 0 ? pointQueue.length - 1 : index - 1;
            return (
              <group key={index}>
                <Line
                  worldUnits
                  points={[pointQueue[before], pointQueue[current]]}
                  color="#00ccdd"
                  transparent
                  opacity={0.6}
                  lineWidth={0.3}
                />
                <QueuePointMarker position={queueItem} />
              </group>
            );
          })}
        </group>
      )}
    </>
  );
});

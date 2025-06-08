import { Line } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import { memo } from 'react';
import * as THREE from 'three';
import { inputAtom } from '../../atoms';

// 목표 위치 마커 - 현대적인 디자인
const TargetMarker = memo(() => (
  <group>
    {/* 외부 링 - 수평으로 회전 */}
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
    {/* 내부 점 */}
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
    {/* 펄스 효과 - 수평으로 회전 */}
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

// 달리기 모드 마커 - 더 큰 효과
const RunModeMarker = memo(() => (
  <group>
    {/* 외부 큰 링 - 수평으로 회전 */}
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
    {/* 중간 링 - 수평으로 회전 */}
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
    {/* 펄스 효과 - 수평으로 회전 */}
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

// 큐 포인트 마커 - 더 세련된 디자인
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
  const inputSystem = useAtomValue(inputAtom);
  const pointer = inputSystem.pointer;
  const clickerOption = inputSystem.clickerOption;

  // 큐에서 Vector3 객체만 필터링
  const pointQueue = clickerOption.queue.filter(
    (item): item is THREE.Vector3 => item instanceof THREE.Vector3,
  );

  return (
    <>
      {/* 메인 타겟 마커 */}
      <group position={pointer.target}>
        {pointer.isActive && <TargetMarker />}
        {pointer.isActive && clickerOption.isRun && pointer.shouldRun && <RunModeMarker />}
      </group>

      {/* 큐 라인과 포인트들 */}
      {clickerOption.line && pointQueue.length > 0 && (
        <group position={[0, 0.1, 0]}>
          {pointQueue.map((queueItem, index) => {
            const current = index;
            const before = index === 0 ? pointQueue.length - 1 : index - 1;

            return (
              <group key={index}>
                {/* 연결 라인 */}
                <Line
                  worldUnits
                  points={[pointQueue[before], pointQueue[current]]}
                  color="#00ccdd"
                  transparent
                  opacity={0.6}
                  lineWidth={0.3}
                />
                {/* 큐 포인트 마커 */}
                <QueuePointMarker position={queueItem} />
              </group>
            );
          })}
        </group>
      )}
    </>
  );
});

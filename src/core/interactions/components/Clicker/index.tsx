import { useEffect, useMemo, useRef, useState } from 'react';

import * as THREE from 'three';
import { useShallow } from 'zustand/react/shallow';

import { PathLine } from './PathLine';
import { TargetMarker } from './TargetMarker';
import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';
import { useClickNavigationRoute } from '../../../navigation/hooks/useNavigation';
import { useEngineFrame } from '../../../runtime/frame';
import { useGaesupStore } from '../../../stores/gaesupStore';
import type { AutomationAction } from '../../core/types';

const EMPTY_ACTIONS: AutomationAction[] = [];
const PLAYER_POSITION_UPDATE_INTERVAL_MS = 150;
const REACH_DISTANCE = 1.0;

export function Clicker() {
  const { getClickNavigationRoute, subscribeClickNavigationRoute } = useClickNavigationRoute();
  const actions = useGaesupStore(useShallow((state) => state.automation?.queue.actions ?? EMPTY_ACTIONS));
  const currentIndex = useGaesupStore((state) => state.automation?.queue.currentIndex ?? 0);
  const mouseTarget = useGaesupStore((state) => state.interaction.mouse.target);
  const isActive = useGaesupStore((state) => state.interaction.mouse.isActive);
  const { position: playerPosition } = usePlayerPosition({
    updateInterval: PLAYER_POSITION_UPDATE_INTERVAL_MS,
    reactive: false,
  });
  const [navigationPoints, setNavigationPoints] = useState(() => [...getClickNavigationRoute()]);
  const markerRef = useRef<THREE.Group>(null);
  const pathPointsRef = useRef<THREE.Vector3[]>([]);

  useEffect(() => {
    const refresh = () => setNavigationPoints([...getClickNavigationRoute()]);
    refresh();
    return subscribeClickNavigationRoute(refresh);
  }, [getClickNavigationRoute, subscribeClickNavigationRoute]);

  const queuePoints = useMemo(
    () =>
      actions
        .map((action) => {
          if (action.type === 'move' && action.target) {
            return new THREE.Vector3(action.target.x, action.target.y, action.target.z);
          }
          return null;
        })
        .filter((point): point is THREE.Vector3 => point !== null),
    [actions],
  );

  const markerPath = useMemo(
    () => [playerPosition, ...(navigationPoints.length > 0 ? navigationPoints : [mouseTarget]), ...queuePoints],
    [playerPosition, navigationPoints, mouseTarget, queuePoints],
  );
  const queuePath = useMemo(
    () => (queuePoints.length > 0 ? [playerPosition, ...queuePoints] : []),
    [playerPosition, queuePoints],
  );

  useEngineFrame(
    'lateUpdate',
    () => {
      const showMarker = isActive && playerPosition.distanceTo(mouseTarget) >= REACH_DISTANCE;
      const marker = markerRef.current;
      if (marker) marker.visible = showMarker;
      pathPointsRef.current = showMarker ? markerPath : queuePath;
    },
    { label: 'interactions:clicker' },
  );

  return (
    <group>
      <group ref={markerRef} position={mouseTarget} visible={false}>
        <TargetMarker />
      </group>

      <PathLine pointsRef={pathPointsRef} color={currentIndex >= 0 ? '#00ff88' : '#ffaa00'} />

      {actions.map((action, index) => {
        if (action.type === 'move' && action.target) {
          const isActiveAction = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <group
              key={`action-${index}`}
              position={[action.target.x, action.target.y, action.target.z]}
            >
              <mesh>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial
                  color={isCompleted ? '#888' : isActiveAction ? '#ff4444' : '#ffaa00'}
                  transparent
                  opacity={isCompleted ? 0.3 : 0.8}
                />
              </mesh>
            </group>
          );
        }
        return null;
      })}
    </group>
  );
}

export default Clicker;

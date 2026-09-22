import { useEffect, useMemo, useRef, useState } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { PathLine } from './PathLine';
import { TargetMarker } from './TargetMarker';
import { useInteractionSystem } from '../../../motions/hooks/useInteractionSystem';
import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';
import { useClickNavigationRoute } from '../../../navigation/hooks/useNavigation';
import { useGaesupStore } from '../../../stores/gaesupStore';

const EMPTY_MOUSE_TARGET = new THREE.Vector3();
const PLAYER_POSITION_UPDATE_INTERVAL_MS = 150;
const REACH_DISTANCE = 1.0;

export function Clicker() {
  const { getClickNavigationRoute, subscribeClickNavigationRoute } = useClickNavigationRoute();
  const automation = useGaesupStore((state) => state.automation);
  const { position: playerPosition } = usePlayerPosition({
    updateInterval: PLAYER_POSITION_UPDATE_INTERVAL_MS,
    reactive: false,
  });
  const { mouse } = useInteractionSystem();
  const [navigationPoints, setNavigationPoints] = useState(() => [...getClickNavigationRoute()]);
  const pathPointsRef = useRef<THREE.Vector3[]>([]);
  const mouseTarget = mouse?.target || EMPTY_MOUSE_TARGET;
  const mouseTargetRef = useRef(mouseTarget);
  mouseTargetRef.current = mouseTarget;
  const [hasReachedTarget, setHasReachedTarget] = useState(
    () => playerPosition.distanceTo(mouseTarget) < REACH_DISTANCE,
  );
  const reachedRef = useRef(hasReachedTarget);

  useFrame(() => {
    const reached = playerPosition.distanceTo(mouseTargetRef.current) < REACH_DISTANCE;
    if (reached === reachedRef.current) return;
    reachedRef.current = reached;
    setHasReachedTarget(reached);
  });

  useEffect(() => {
    const refresh = () => setNavigationPoints([...getClickNavigationRoute()]);
    refresh();
    return subscribeClickNavigationRoute(refresh);
  }, [getClickNavigationRoute, subscribeClickNavigationRoute]);

  const isActive = mouse?.isActive || false;
  const queue = automation?.queue || { actions: [], currentIndex: 0 };
  const actions = queue.actions || [];
  const currentIndex = queue.currentIndex || 0;

  const shouldShowMarker = isActive && !hasReachedTarget;

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

  const routedPoints = navigationPoints.length > 0 ? navigationPoints : [mouseTarget];
  pathPointsRef.current = shouldShowMarker
    ? [playerPosition, ...routedPoints, ...queuePoints]
    : queuePoints.length > 0
      ? [playerPosition, ...queuePoints]
      : [];

  return (
    <group>
      {shouldShowMarker && (
        <group position={mouseTarget}>
          <TargetMarker />
        </group>
      )}

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

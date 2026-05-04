import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import { V3 } from '@utils/vector';

import { ClickerMoveOptions, ClickerResult } from './types';
import type { InputAdapter } from '../../interactions/core';
import { useInputBackend } from '../../interactions/hooks';
import { useStateSystem } from '../../motions/hooks/useStateSystem';
import {
  clearClickNavigationRoute,
  isLatestClickNavigationRequest,
  nextClickNavigationRequest,
  setClickNavigationRoute,
} from '../../navigation/ClickNavigationRoute';
import { NavigationSystem } from '../../navigation/NavigationSystem';

function updateMouseTarget(
  inputBackend: InputAdapter,
  target: THREE.Vector3,
  currentPosition: THREE.Vector3,
  shouldRun: boolean,
): void {
  const angle = Math.atan2(
    target.z - currentPosition.z,
    target.x - currentPosition.x,
  );
  inputBackend.updateMouse({
    target,
    angle,
    position: new THREE.Vector2(target.x, target.z),
    isActive: true,
    shouldRun,
  });
}

export function useClicker(options: ClickerMoveOptions = {}): ClickerResult {
  const {
    minHeight = 0.5,
    offsetY = 0.5,
    useNavigation = true,
    simplifyPath = true,
    waypointThreshold = 1,
    fallbackToDirectOnFail = true,
    agentRadius = 0.35,
    agentWidth,
    agentDepth,
    clearance,
  } = options;
  const { activeState } = useStateSystem();
  const inputBackend = useInputBackend();
  const isReady = Boolean(activeState?.position);
  const moveClicker = (
    event: ThreeEvent<MouseEvent>,
    isRun: boolean,
    type: 'normal' | 'ground',
  ): boolean => {
    if (type !== 'ground') {
      return false;
    }
    if (!activeState?.position) {
      return false;
    }
    try {
      const currentPosition = activeState.position;
      const targetPoint = V3(event.point.x, event.point.y, event.point.z);
      const adjustedY = Math.max(targetPoint.y + offsetY, minHeight);
      const finalTarget = V3(targetPoint.x, adjustedY, targetPoint.z);
      const startPosition = currentPosition.clone();
      const requestId = nextClickNavigationRequest();

      if (!useNavigation) {
        clearClickNavigationRoute();
        updateMouseTarget(inputBackend, finalTarget, startPosition, isRun);
        return true;
      }

      void NavigationSystem.getInstance().init().then(() => {
        if (!isLatestClickNavigationRequest(requestId)) return;

        const navigation = NavigationSystem.getInstance();
        const agentSize = {
          agentRadius,
          ...(agentWidth !== undefined ? { agentWidth } : {}),
          ...(agentDepth !== undefined ? { agentDepth } : {}),
          ...(clearance !== undefined ? { clearance } : {}),
        };
        finalTarget.y = Math.max(navigation.sampleHeight(finalTarget.x, finalTarget.z) + offsetY, minHeight);
        if (navigation.hasLineOfSight(startPosition.x, startPosition.z, finalTarget.x, finalTarget.z, agentSize)) {
          setClickNavigationRoute([finalTarget], waypointThreshold, isRun);
          updateMouseTarget(inputBackend, finalTarget, startPosition, isRun);
          return;
        }

        const rawPath = navigation.findPath(
          startPosition.x,
          startPosition.z,
          finalTarget.x,
          finalTarget.z,
          {
            weighted: true,
            ...agentSize,
          },
        );
        if (rawPath.length === 0) {
          clearClickNavigationRoute();
          if (
            fallbackToDirectOnFail &&
            !navigation.hasNavigationConstraints() &&
            navigation.isWalkable(finalTarget.x, finalTarget.z, agentSize)
          ) {
            setClickNavigationRoute([finalTarget], waypointThreshold, isRun);
            updateMouseTarget(inputBackend, finalTarget, startPosition, isRun);
          }
          return;
        }

        const route = simplifyPath
          ? navigation.smoothPath(
              rawPath,
              [startPosition.x, startPosition.y, startPosition.z],
              [finalTarget.x, finalTarget.y, finalTarget.z],
              agentSize,
            )
          : rawPath;
        const waypoints = route
          .map((point) => new THREE.Vector3(point[0], point[1], point[2]))
          .filter((point) => point.distanceTo(startPosition) > waypointThreshold);
        const lastWaypoint = waypoints[waypoints.length - 1];
        if (!lastWaypoint || lastWaypoint.distanceTo(finalTarget) > waypointThreshold) {
          waypoints.push(finalTarget);
        }

        const path = waypoints.length > 0 ? waypoints : [finalTarget];
        setClickNavigationRoute(path, waypointThreshold, isRun);
        updateMouseTarget(inputBackend, path[0] ?? finalTarget, startPosition, isRun);
      });

      return true;
    } catch (error) {
      console.error('moveClicker error:', error);
      return false;
    }
  };

  const stopClicker = (): void => {
    try {
      if (!isReady) return;
      nextClickNavigationRequest();
      clearClickNavigationRoute();
      inputBackend.updateMouse({ isActive: false, shouldRun: false });
    } catch {
    } 
  };

  const onClick = (event: ThreeEvent<MouseEvent>): void => {
    moveClicker(event, false, 'ground');
  };

  return {
    moveClicker,
    stopClicker,
    onClick,
    isReady,
  };
}

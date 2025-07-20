import React from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';
import { useInteractionSystem } from '../../../motions/hooks/useInteractionSystem';
import { TargetMarker } from './TargetMarker';
import { PathLine } from './PathLine';

export function Clicker() {
  const automation = useGaesupStore((state) => state.automation);
  const { position: playerPosition } = usePlayerPosition();
  const { mouse } = useInteractionSystem();
  
  // Use 3D target position from InteractionSystem
  const mouseTarget = mouse?.target || new THREE.Vector3();
  const isActive = mouse?.isActive || false;
  const queue = automation?.queue || { actions: [], currentIndex: 0 };
  const actions = queue.actions || [];
  const currentIndex = queue.currentIndex || 0;
  
  // Check if player has reached the target (within 1 unit distance)
  const distanceToTarget = playerPosition.distanceTo(mouseTarget);
  const hasReachedTarget = distanceToTarget < 1.0;
  const shouldShowMarker = isActive && !hasReachedTarget;
  
  const queuePoints = actions.map(action => {
    if (action.type === 'move' && action.target) {
      return new THREE.Vector3(action.target.x, action.target.y, action.target.z);
    }
    return null;
  }).filter(Boolean);

  // Start from player position
  const allPoints = shouldShowMarker ? [playerPosition, mouseTarget, ...queuePoints] : queuePoints.length > 0 ? [playerPosition, ...queuePoints] : [];

  return (
    <group>
      {/* Show target marker only when active and not reached */}
      {shouldShowMarker && (
        <group position={mouseTarget}>
          <TargetMarker />
        </group>
      )}

      {allPoints.length > 1 && (
        <PathLine 
          points={allPoints} 
          color={currentIndex >= 0 ? "#00ff88" : "#ffaa00"} 
        />
      )}

      {actions.map((action, index) => {
        if (action.type === 'move' && action.target) {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <group
              key={`action-${index}`}
              position={[action.target.x, action.target.y, action.target.z]}
            >
              <mesh>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial
                  color={isCompleted ? "#888" : isActive ? "#ff4444" : "#ffaa00"}
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

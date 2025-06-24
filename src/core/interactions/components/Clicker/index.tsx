import React from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { TargetMarker } from './TargetMarker';
import { PathLine } from './PathLine';

export function Clicker() {
  const interaction = useGaesupStore((state) => state.interaction);
  const automation = useGaesupStore((state) => state.automation);
  
  const mousePos = interaction?.mouse?.position || new THREE.Vector2();
  const queue = automation?.queue || { actions: [], currentIndex: 0 };
  const actions = queue.actions || [];
  const currentIndex = queue.currentIndex || 0;

  const mousePosition = new THREE.Vector3(mousePos.x, 0.5, mousePos.y);
  
  const queuePoints = actions.map(action => {
    if (action.type === 'move' && action.target) {
      return new THREE.Vector3(action.target.x, action.target.y, action.target.z);
    }
    return mousePosition;
  }).filter(Boolean);

  const allPoints = [mousePosition, ...queuePoints];

  return (
    <group>
      <group position={[mousePos.x, 0.5, mousePos.y]}>
        <TargetMarker />
      </group>

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

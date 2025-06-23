import React, { useState, useEffect } from 'react';
import { Line } from '@react-three/drei';
import { memo } from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '@stores/gaesupStore';

const TargetMarker = memo(() => (
  <group>
    <mesh>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial
        color="#00ff88"
        emissive="#00ff88"
        emissiveIntensity={0.5}
        transparent
        opacity={0.9}
      />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.5, 8]} />
      <meshStandardMaterial
        color="#00ff88"
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  </group>
));

const PathLine = memo(({ points, color }: { points: THREE.Vector3[], color: string }) => {
  if (points.length < 2) return null;
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      dashed={false}
    />
  );
});

export function Clicker() {
  const interaction = useGaesupStore((state) => state.interaction);
  const automation = useGaesupStore((state) => state.automation);
  
  console.log('Clicker Debug:', { 
    interaction: !!interaction, 
    automation: !!automation,
    mouse: interaction?.mouse ? 'exists' : 'missing',
    mousePosition: interaction?.mouse?.position ? `x:${interaction.mouse.position.x}, y:${interaction.mouse.position.y}` : 'no position',
    queue: automation?.queue ? 'exists' : 'missing'
  });
  
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

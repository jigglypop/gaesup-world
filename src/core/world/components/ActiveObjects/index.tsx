import * as THREE from 'three';
import { ActiveObjectProps } from './types';
import { Vehicle } from './Vehicle';
import { Airplane } from './Airplane';
import { Character } from './Character';

export function ActiveObjects({ 
  objects, 
  selectedId, 
  onSelect, 
  showDebugInfo = false 
}: ActiveObjectProps) {
  return (
    <group name="active-objects">
      {objects.map((obj) => {
        const isSelected = obj.id === selectedId;
        
        switch (obj.type) {
          case 'vehicle':
            return (
              <Vehicle
                key={obj.id}
                object={obj}
                selected={isSelected}
                onSelect={onSelect}
                showDebugInfo={showDebugInfo}
              />
            );
          case 'airplane':
            return (
              <Airplane
                key={obj.id}
                object={obj}
                selected={isSelected}
                onSelect={onSelect}
                showDebugInfo={showDebugInfo}
              />
            );
          case 'character':
            return (
              <Character
                key={obj.id}
                object={obj}
                selected={isSelected}
                onSelect={onSelect}
                showDebugInfo={showDebugInfo}
              />
            );
          default:
            return (
              <mesh
                key={obj.id}
                position={[obj.position.x, obj.position.y, obj.position.z]}
                rotation={[obj.rotation.x, obj.rotation.y, obj.rotation.z]}
                scale={[obj.scale.x, obj.scale.y, obj.scale.z]}
                onClick={() => onSelect?.(obj.id)}
              >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial 
                  color={isSelected ? "#ff4444" : "#4444ff"} 
                  wireframe={showDebugInfo}
                />
              </mesh>
            );
        }
      })}
    </group>
  );
}

export * from './Vehicle';
export * from './Airplane';
export * from './Character';
export * from './types';

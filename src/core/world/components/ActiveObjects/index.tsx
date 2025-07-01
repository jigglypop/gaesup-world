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
            return null;
        }
      })}
    </group>
  );
}

export * from './Vehicle';
export * from './Airplane';
export * from './Character';
export * from './types';

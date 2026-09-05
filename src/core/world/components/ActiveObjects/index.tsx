import { useGaesupStore } from '@stores/gaesupStore';

import { Airplane } from './Airplane';
import { Character } from './Character';
import { ActiveObjectProps } from './types';
import { Vehicle } from './Vehicle';
import { useStateSystem } from '../../../motions/hooks/useStateSystem';

export function ActiveObjects({ 
  objects, 
  selectedId, 
  onSelect, 
  showDebugInfo = false 
}: ActiveObjectProps) {
  const { gameStates } = useStateSystem();
  const mode = useGaesupStore((state) => state.mode);
  
  return (
    <group name="active-objects">
      {objects.map((obj) => {
        const isSelected = obj.id === selectedId;
        
        if (obj.type === 'character' && gameStates?.isRiding && mode?.type !== 'character') {
          return null;
        }
        
        switch (obj.type) {
          case 'vehicle':
            return (
              <Vehicle
                key={obj.id}
                object={obj}
                selected={isSelected}
                {...(onSelect ? { onSelect } : {})}
                showDebugInfo={showDebugInfo}
              />
            );
          case 'airplane':
            return (
              <Airplane
                key={obj.id}
                object={obj}
                selected={isSelected}
                {...(onSelect ? { onSelect } : {})}
                showDebugInfo={showDebugInfo}
              />
            );
          case 'character':
            return (
              <Character
                key={obj.id}
                object={obj}
                selected={isSelected}
                {...(onSelect ? { onSelect } : {})}
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

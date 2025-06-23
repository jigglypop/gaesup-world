import { vec3 } from '@react-three/rapier';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '@stores/gaesupStore';
import { useClicker } from '@hooks/useClicker';
import { WorldPropsType } from './types';

export function WorldProps({ 
  type = 'normal', 
  text, 
  position, 
  children,
  interactive = true,
  showMinimap = true 
}: WorldPropsType) {
  const groupRef = useRef<THREE.Group>(null);
  const addMinimapMarker = useGaesupStore((state) => state.addMinimapMarker);
  const clickerStates = useClicker();

  useEffect(() => {
    if (showMinimap && groupRef.current && position) {
      const marker = {
        id: `prop-${Date.now()}`,
        position: vec3(position),
        type: type as 'normal' | 'target' | 'special',
        label: text || 'Prop'
      };
      addMinimapMarker(marker);
    }
  }, [addMinimapMarker, position, type, text, showMinimap]);

  return (
    <group 
      ref={groupRef}
      position={position}
      onClick={(e) => {
        if (interactive) {
          e.stopPropagation();
          clickerStates.onClick(e);
        }
      }}
    >
      {children}
      
      {text && (
        <group position={[0, 2, 0]}>
          <sprite scale={[2, 0.5, 1]}>
            <spriteMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.8}
            />
          </sprite>
        </group>
      )}
    </group>
  );
}

export * from './types';

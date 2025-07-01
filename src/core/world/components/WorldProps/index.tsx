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
  const removeMinimapMarker = useGaesupStore((state) => state.removeMinimapMarker);
  const clickerStates = useClicker();
  const markerId = useRef<string>(`world-prop-${Date.now()}-${Math.random()}`);

  useEffect(() => {
    if (showMinimap && groupRef.current) {
      const updateMinimapMarker = () => {
        const group = groupRef.current;
        if (!group) return;
        
        const box = new THREE.Box3();
        box.setFromObject(group);
        
        if (!box.isEmpty()) {
          const center = new THREE.Vector3();
          const size = new THREE.Vector3();
          box.getCenter(center);
          box.getSize(size);
          
          if (position) {
            center.add(new THREE.Vector3(position[0], position[1], position[2]));
          }
          
          addMinimapMarker(markerId.current, {
            type: type as 'normal' | 'ground',
            text: text || '',
            center,
            size,
          });
        }
      };
      
      const timer = setTimeout(updateMinimapMarker, 100);
      
      return () => {
        clearTimeout(timer);
        removeMinimapMarker(markerId.current);
      };
    }
  }, [addMinimapMarker, removeMinimapMarker, position, type, text, showMinimap]);

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

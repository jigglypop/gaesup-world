import { vec3 } from '@react-three/rapier';
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { MinimapEngine } from '../../../ui/core';
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
  const clickerStates = useClicker();
  const markerId = useMemo(() => `world-prop-${Date.now()}-${Math.random()}`, []);
  
  // Reusable THREE.js objects
  const vectorsRef = useRef({
    center: new THREE.Vector3(),
    size: new THREE.Vector3(),
    positionAdd: new THREE.Vector3()
  });

  useEffect(() => {
    if (showMinimap && groupRef.current) {
      const engine = MinimapEngine.getInstance();
      const updateMinimapMarker = () => {
        const group = groupRef.current;
        if (!group) return;
        
        const box = new THREE.Box3();
        box.setFromObject(group);
        
        if (!box.isEmpty()) {
          const { center, size, positionAdd } = vectorsRef.current;
          box.getCenter(center);
          box.getSize(size);
          
          if (position) {
            positionAdd.set(position[0], position[1], position[2]);
            center.add(positionAdd);
          }
          
          engine.addMarker(
            markerId,
            type as 'normal' | 'ground',
            text || '',
            center.clone(), // Clone only when passing to engine
            size.clone() // Clone only when passing to engine
          );
        }
      };
      
      const timer = setTimeout(updateMinimapMarker, 100);
      
      return () => {
        clearTimeout(timer);
        engine.removeMarker(markerId);
      };
    }
  }, [position, type, text, showMinimap, markerId]);

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

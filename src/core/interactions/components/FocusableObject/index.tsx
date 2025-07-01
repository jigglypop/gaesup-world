import React, { forwardRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { useGaesupStore } from '../../../stores/gaesupStore';
import * as THREE from 'three';
import { FocusableObjectProps } from './types';

export const FocusableObject = forwardRef<THREE.Group, FocusableObjectProps>(
  ({ children, position, focusDistance = 10, focusDuration = 1, onFocus, onBlur, ...props }, ref) => {
    const setCameraOption = useGaesupStore((state) => state.setCameraOption);
    const cameraOption = useGaesupStore((state) => state.cameraOption);
    
    const setBlock = useGaesupStore((state) => state.setBlock);
    
    const handleClick = (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      
      if (!cameraOption?.enableFocus) return;
      
      const objectPosition = event.object.getWorldPosition(new THREE.Vector3());
      
      setCameraOption({
        ...cameraOption,
        focusTarget: objectPosition,
        focusDuration: focusDuration,
        focusDistance: focusDistance,
        focus: true
      });
      
      // 포커싱 모드일 때 캐릭터 컨트롤 블록
      setBlock({ control: true });
      
      if (onFocus) {
        onFocus(event);
      }
    };
    
    const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
      if (cameraOption?.enableFocus) {
        document.body.style.cursor = 'pointer';
      }
    };
    
    const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
      document.body.style.cursor = 'default';
      if (onBlur) {
        onBlur(event);
      }
    };
    
    return (
      <group 
        ref={ref}
        position={position}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        {...props}
      >
        {children}
      </group>
    );
  }
);

FocusableObject.displayName = 'FocusableObject'; 
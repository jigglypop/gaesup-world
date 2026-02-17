import { forwardRef } from 'react';

import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import { FocusableObjectProps } from './types';
import { useGaesupStore } from '../../../stores/gaesupStore';

export function unfocusCamera() {
  const { cameraOption, setCameraOption } = useGaesupStore.getState();
  if (!cameraOption?.focus) return;
  setCameraOption({
    focus: false,
    focusTarget: undefined,
  });
}

export const FocusableObject = forwardRef<THREE.Group, FocusableObjectProps>(
  ({ children, position, focusDistance = 10, focusDuration = 1, onFocus, onBlur, ...props }, ref) => {
    const setCameraOption = useGaesupStore((state) => state.setCameraOption);
    const cameraOption = useGaesupStore((state) => state.cameraOption);

    const handleClick = (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      if (!cameraOption?.enableFocus) return;

      if (cameraOption.focus) {
        unfocusCamera();
        if (onBlur) onBlur(event as unknown as ThreeEvent<PointerEvent>);
        return;
      }

      const objectPosition = event.object.getWorldPosition(new THREE.Vector3());
      
      setCameraOption({
        focusTarget: objectPosition,
        focusDuration: focusDuration,
        focusDistance: focusDistance,
        focus: true,
      });
      if (onFocus) {
        onFocus(event);
      }
    };
    
    const handlePointerOver = () => {
      if (cameraOption?.enableFocus) {
        document.body.style.cursor = 'pointer';
      }
    };
    
    const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
      document.body.style.cursor = 'default';
      if (onBlur && !cameraOption?.focus) {
        onBlur(event);
      }
    };
    
    const groupProps = {
      ...props,
      ...(position ? { position } : {}),
    };

    return (
      <group 
        ref={ref}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        {...groupProps}
      >
        {children}
      </group>
    );
  }
);

FocusableObject.displayName = 'FocusableObject'; 
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraEngine } from '../core/CameraEngine';
import { CameraCalcProps } from '../core/types';
import { useGaesupStore } from '../../stores/gaesupStore';

export function useCamera() {
  const engineRef = useRef<CameraEngine>();
  const block = useGaesupStore((state) => state.block);
  const activeState = useGaesupStore((state) => state.activeState);
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const mode = useGaesupStore((state) => state.mode);
  
  useEffect(() => {
    engineRef.current = new CameraEngine();
    
    setTimeout(() => {
      if (engineRef.current) {
        engineRef.current.updateConfig({
          mode: mode?.control || 'thirdPerson',
          ...cameraOption,
        });
      }
    }, 100);
  }, []);
  
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateConfig({
        mode: mode?.control || 'thirdPerson',
        ...cameraOption,
      });
    }
  }, [cameraOption, mode]);
  
  useFrame((state, delta) => {
    if (!engineRef.current || block.camera) return;
    
    const calcProps: CameraCalcProps = {
      camera: state.camera,
      scene: state.scene,
      deltaTime: delta,
      activeState,
      clock: state.clock,
      excludeObjects: [],
    };
    
    engineRef.current.calculate(calcProps);
  });
  
  return {
    engine: engineRef.current,
  };
} 
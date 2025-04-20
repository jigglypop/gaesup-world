import React, { useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { GaesupWorldContext } from '../../src/gaesup/world/context';
import { useContext } from 'react';

// 카메라 회전 테스트 컴포넌트
export default function CameraRotationTest() {
  const { activeState, dispatch } = useContext(GaesupWorldContext);
  const [rotation, setRotation] = useState(0);

  // 회전 각도 변경 함수
  const handleRotationChange = useCallback((angle: number) => {
    setRotation(angle);
    
    if (!dispatch || !activeState) return;
    
    // 직접 카메라 포지션 업데이트
    const distance = 20;
    const height = 20;
    
    // 캐릭터 주변을 회전하는 카메라 위치 계산
    const x = activeState.position.x + distance * Math.sin(angle);
    const z = activeState.position.z + distance * Math.cos(angle);
    
    // 직접 dispatch 호출
    dispatch({
      type: 'UPDATE_CAMERA_CONTROLS',
      payload: {
        position: { 
          x, 
          y: activeState.position.y + height, 
          z 
        },
        target: activeState.position,
        rotation: { x: 0, y: angle, z: 0 },
      }
    });
    
    console.log('카메라 회전 각도 변경:', angle);
  }, [dispatch, activeState]);

  // 자동 회전 효과
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const newAngle = t * 0.1 % (Math.PI * 2);
    handleRotationChange(newAngle);
  });

  return null; // 시각적 요소 없음, 로직만 처리
} 
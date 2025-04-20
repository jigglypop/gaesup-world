import { useContext, useState, useCallback, useEffect } from 'react';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../world/context';
import * as THREE from 'three';

/**
 * 회전 제어를 위한 커스텀 훅
 * 미니맵 회전에 따라 카메라 회전을 제어
 */
export const useRotation = () => {
  const worldContext = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { activeState, mode, cameraOption } = worldContext;
  const [rotationAngle, setRotationAngle] = useState(0);
  
  // 현재 컨트롤 모드가 normal인지 확인
  const isNormalMode = mode?.control === 'normal';

  /**
   * 회전 각도 변경 핸들러
   * @param angle 라디안 단위의 회전 각도
   */
  const handleRotationChange = useCallback((angle: number) => {
    setRotationAngle(angle);
    
    if (!dispatch || !activeState) return;
    
    // normal 모드에서는 카메라만 회전
    if (isNormalMode) {
      // 카메라 회전 - 캐릭터 중심으로 회전
      const distance = 20; // 카메라와 캐릭터 사이 거리
      const height = 20;   // 카메라 높이
      
      // 캐릭터 주변을 회전하는 카메라 위치 계산
      const cameraPos = calculateCameraPosition(distance, height, angle);
      
      // 카메라 컨트롤 업데이트
      dispatch({
        type: 'UPDATE_CAMERA_CONTROLS',
        payload: {
          position: cameraPos,
          target: activeState.position, // 항상 캐릭터를 바라봄
          rotation: { x: 0, y: angle, z: 0 },
        }
      });
      
      // 카메라 옵션도 함께 업데이트
      if (cameraOption) {
        dispatch({
          type: 'UPDATE_CAMERA_OPTION',
          payload: {
            ...cameraOption,
            XDistance: cameraPos.x - activeState.position.x,
            YDistance: cameraPos.y - activeState.position.y,
            ZDistance: cameraPos.z - activeState.position.z,
            rotationY: angle,
          },
        });
      }
    } else {
      // non-normal 모드에서는 캐릭터 방향 회전
      dispatch({
        type: 'UPDATE_ACTIVE_STATE',
        payload: {
          ...activeState,
          euler: {
            ...activeState.euler,
            y: angle,
          },
          direction: angle,
        },
      });
      
      // 캐릭터 모드 업데이트
      dispatch({
        type: 'UPDATE_MODE',
        payload: {
          ...mode,
          orientation: angle,
        },
      });
    }

  }, [dispatch, activeState, mode, cameraOption, isNormalMode]);

  // 회전 상태 업데이트
  useEffect(() => {
    // normal 모드에서는 카메라 회전 각도 사용
    if (isNormalMode && cameraOption && cameraOption.rotationY !== undefined) {
      setRotationAngle(cameraOption.rotationY);
    }
    // non-normal 모드에서는 캐릭터 방향 사용
    else if (!isNormalMode && activeState && activeState.euler) {
      setRotationAngle(activeState.euler.y);
    }
  }, [isNormalMode, cameraOption, activeState]);

  /**
   * 카메라 위치를 회전 각도에 맞게 조정
   * @param distance 카메라와 대상과의 거리
   * @param height 카메라 높이
   * @param angle 회전 각도 (기본값은 현재 회전 각도)
   */
  const calculateCameraPosition = useCallback(
    (distance: number = 20, height: number = 20, angle: number = rotationAngle) => {
      if (!activeState?.position) {
        return { 
          x: distance * Math.sin(angle), 
          y: height, 
          z: distance * Math.cos(angle) 
        };
      }

      // 캐릭터 중심으로 카메라가 원형으로 회전
      const x = activeState.position.x + distance * Math.sin(angle);
      const z = activeState.position.z + distance * Math.cos(angle);
      
      return { 
        x, 
        y: activeState.position.y + height, 
        z 
      };
    },
    [activeState, rotationAngle]
  );

  // 카메라 회전 직접 적용 함수
  const rotateCameraTo = useCallback((angle: number) => {
    handleRotationChange(angle);
  }, [handleRotationChange]);

  return {
    rotationAngle,
    setRotationAngle: rotateCameraTo,
    handleRotationChange,
    calculateCameraPosition,
    miniMapProps: {
      onRotationChange: handleRotationChange,
      blockRotate: false,
    }
  };
}; 
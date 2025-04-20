import { useMemo } from 'react';
import {
  useActiveState,
  useCamera,
  useWorldState,
  useController,
  useWorldDispatch,
  useControllerDispatch,
} from '../context';

// 통합 훅 - 모든 컨텍스트에 접근
export function useGaesup() {
  const activeState = useActiveState();
  const camera = useCamera();
  const worldState = useWorldState();
  const controller = useController();
  const worldDispatch = useWorldDispatch();
  const controllerDispatch = useControllerDispatch();

  return useMemo(
    () => ({
      // 상태
      activeState,
      camera,
      worldState,
      controller,

      // 디스패치
      worldDispatch,
      controllerDispatch,

      // 편의 기능
      updatePosition: (position) => {
        worldDispatch({
          type: 'update',
          payload: {
            activeState: {
              ...activeState,
              position,
            },
          },
        });
      },

      updateCamera: (options) => {
        worldDispatch({
          type: 'update',
          payload: {
            cameraOption: {
              ...camera,
              ...options,
            },
          },
        });
      },

      setEntityType: (type) => {
        worldDispatch({
          type: 'update',
          payload: {
            mode: {
              ...worldState.mode,
              type,
            },
          },
        });
      },
    }),
    [activeState, camera, worldState, controller, worldDispatch, controllerDispatch],
  );
}

// 선택적 훅 - 필요한 부분만 구독
export function useGaesupPosition() {
  const activeState = useActiveState();
  const worldDispatch = useWorldDispatch();

  return useMemo(
    () => ({
      position: activeState.position,
      velocity: activeState.velocity,
      direction: activeState.direction,
      updatePosition: (pos) => {
        worldDispatch({
          type: 'update',
          payload: {
            activeState: {
              ...activeState,
              position: pos,
            },
          },
        });
      },
    }),
    [activeState.position, activeState.velocity, activeState.direction, worldDispatch],
  );
}

export function useGaesupCamera() {
  const camera = useCamera();
  const worldDispatch = useWorldDispatch();

  return useMemo(
    () => ({
      ...camera,
      updateCamera: (options) => {
        worldDispatch({
          type: 'update',
          payload: {
            cameraOption: {
              ...camera,
              ...options,
            },
          },
        });
      },
    }),
    [camera, worldDispatch],
  );
}

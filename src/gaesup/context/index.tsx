import React, { createContext, useReducer, useMemo, useContext } from 'react';
import {
  GaesupWorldContextType,
  GaesupControllerType,
  DispatchType,
  ActiveStateType,
  CameraOptionType,
} from '../types';

// 초기 상태
import { worldInitialState } from './initialStates';
import { controllerInitialState } from './initialStates';

// 리듀서
import { worldReducer } from './reducers';
import { controllerReducer } from './reducers';

// --- 컨텍스트 정의 ---
// 1. 세분화된 컨텍스트 (선택적 구독 지원)
export const ActiveStateContext = createContext<ActiveStateType>(null);
export const CameraContext = createContext<CameraOptionType>(null);
export const WorldContext = createContext<GaesupWorldContextType>(null);
export const ControllerContext = createContext<GaesupControllerType>(null);

// 2. 디스패치 컨텍스트 (별도 분리)
export const WorldDispatchContext = createContext<DispatchType<GaesupWorldContextType>>(null);
export const ControllerDispatchContext = createContext<DispatchType<GaesupControllerType>>(null);

// --- 커스텀 훅 ---
export const useActiveState = () => useContext(ActiveStateContext);
export const useCamera = () => useContext(CameraContext);
export const useWorldState = () => useContext(WorldContext);
export const useController = () => useContext(ControllerContext);
export const useWorldDispatch = () => useContext(WorldDispatchContext);
export const useControllerDispatch = () => useContext(ControllerDispatchContext);

// 선택적 구독을 위한 셀렉터 훅
export function useWorldSelector<T>(selector: (state: GaesupWorldContextType) => T): T {
  const state = useContext(WorldContext);
  return selector(state);
}

export function useControllerSelector<T>(selector: (state: GaesupControllerType) => T): T {
  const state = useContext(ControllerContext);
  return selector(state);
}

// --- 통합 프로바이더 ---
export const GaesupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 월드 상태와 디스패치
  const [worldState, worldDispatch] = useReducer(worldReducer, worldInitialState);

  // 컨트롤러 상태와 디스패치
  const [controllerState, controllerDispatch] = useReducer(
    controllerReducer,
    controllerInitialState,
  );

  // 자주 사용되는 상태 메모이제이션 (성능 최적화)
  const activeState = useMemo(
    () => worldState.activeState,
    [
      worldState.activeState.position.x,
      worldState.activeState.position.y,
      worldState.activeState.position.z,
      worldState.activeState.euler.x,
      worldState.activeState.euler.y,
      worldState.activeState.euler.z,
    ],
  );

  const cameraOption = useMemo(
    () => worldState.cameraOption,
    [
      worldState.cameraOption.position.x,
      worldState.cameraOption.position.y,
      worldState.cameraOption.position.z,
      worldState.cameraOption.maxDistance,
      worldState.cameraOption.focus,
    ],
  );

  return (
    <ControllerContext.Provider value={controllerState}>
      <ControllerDispatchContext.Provider value={controllerDispatch}>
        <WorldContext.Provider value={worldState}>
          <WorldDispatchContext.Provider value={worldDispatch}>
            <ActiveStateContext.Provider value={activeState}>
              <CameraContext.Provider value={cameraOption}>{children}</CameraContext.Provider>
            </ActiveStateContext.Provider>
          </WorldDispatchContext.Provider>
        </WorldContext.Provider>
      </ControllerDispatchContext.Provider>
    </ControllerContext.Provider>
  );
};

// 레거시 지원을 위한 별칭 (기존 코드와 호환성 유지)
export const GaesupWorldContext = WorldContext;
export const GaesupWorldDispatchContext = WorldDispatchContext;
export const GaesupControllerContext = ControllerContext;

import { GaesupWorldContextType, GaesupControllerType } from '../types';

// 깊은 복사 방지를 위한 헬퍼 (성능 최적화)
const shallowMerge = <T extends Record<string, any>>(state: T, payload: Partial<T>): T => {
  const result = { ...state } as T;

  Object.keys(payload).forEach((key) => {
    const k = key as keyof T;
    // 내부 객체 처리
    if (typeof payload[k] === 'object' && payload[k] !== null && !Array.isArray(payload[k])) {
      result[k] = { ...state[k], ...payload[k] } as T[keyof T];
    } else {
      result[k] = payload[k] as T[keyof T];
    }
  });

  return result;
};

// 월드 리듀서
export const worldReducer = (
  state: GaesupWorldContextType,
  action: { type: string; payload: Partial<GaesupWorldContextType> },
) => {
  switch (action.type) {
    case 'update':
      return shallowMerge(state, action.payload);
    case 'reset':
      return { ...action.payload };
    default:
      return state;
  }
};

// 컨트롤러 리듀서
export const controllerReducer = (
  state: GaesupControllerType,
  action: { type: string; payload: Partial<GaesupControllerType> },
) => {
  switch (action.type) {
    case 'update':
      return shallowMerge(state, action.payload);
    case 'reset':
      return { ...action.payload };
    default:
      return state;
  }
};

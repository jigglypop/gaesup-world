import { GaesupWorldContextType, GaesupControllerType } from '../types';

// 깊은 복사 방지를 위한 헬퍼 (성능 최적화)
const shallowMerge = (state, payload) => {
  const result = { ...state };

  Object.keys(payload).forEach((key) => {
    // 내부 객체 처리
    if (typeof payload[key] === 'object' && payload[key] !== null && !Array.isArray(payload[key])) {
      result[key] = { ...state[key], ...payload[key] };
    } else {
      result[key] = payload[key];
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

import { gaesupWorldContextType } from './type';

type ActionType =
  | { type: 'init'; payload?: Partial<gaesupWorldContextType> }
  | { type: 'update'; payload?: Partial<gaesupWorldContextType> }
  | { type: 'batch'; payload: Array<{ type: string; payload?: Partial<gaesupWorldContextType> }> };

export function gaesupWorldReducer(
  state: Partial<gaesupWorldContextType>,
  action: ActionType,
): Partial<gaesupWorldContextType> {
  switch (action.type) {
    case 'init': {
      return { ...state, ...action.payload };
    }
    case 'update': {
      // Deep merge for nested objects
      const newState = { ...state };
      if (action.payload) {
        Object.keys(action.payload).forEach((key) => {
          const value = action.payload[key];
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            newState[key] = { ...newState[key], ...value };
          } else {
            newState[key] = value;
          }
        });
      }
      return newState;
    }
    case 'batch': {
      // Handle multiple updates in a single dispatch
      return action.payload.reduce((acc, curr) => {
        return gaesupWorldReducer(acc, curr);
      }, state);
    }
    default:
      return state;
  }
}

import { dispatchType } from '../types';

export const update = <T>(payload: Partial<T>, dispatch: dispatchType<T>) => {
  dispatch({ type: 'update', payload });
};

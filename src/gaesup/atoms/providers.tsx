'use client';
import { ReactNode, useEffect } from 'react';
import { useGaesupStore } from '../stores/gaesupStore';
import { gaesupWorldContextType } from './types';

interface GaesupProviderProps {
  children: ReactNode;
  initialState?: Partial<gaesupWorldContextType>;
}

export function GaesupProvider({ children, initialState = {} }: GaesupProviderProps) {
  const initializeState = useGaesupStore((state) => state.initializeState);

  useEffect(() => {
    initializeState(initialState);
  }, [initialState, initializeState]);

  return <>{children}</>;
}

export { useGaesupContext, useGaesupDispatch, useGaesup } from '../stores/gaesupStore';
export { gaesupWorldDefault } from '../stores/gaesupStore';

export function gaesupWorldReducer(
  props: Partial<gaesupWorldContextType>,
  action: {
    type: string;
    payload?: Partial<gaesupWorldContextType>;
  },
) {
  switch (action.type) {
    case 'init':
      return { ...props };
    case 'update':
      return { ...props, ...action.payload };
    default:
      return props;
  }
}

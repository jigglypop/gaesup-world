import { useShallow } from 'zustand/react/shallow';

import { useGaesupStore } from '@stores/gaesupStore';

import { UseGaesupControllerResult } from './types';
import { useStateSystem } from '../../motions/hooks/useStateSystem';

export function useGaesupController(): UseGaesupControllerResult {
  const { activeState, gameStates } = useStateSystem();
  const mode = useGaesupStore((state) => state.mode);
  const control = useGaesupStore((state) => state.controllerOptions);
  const controller = useGaesupStore(useShallow((state) => state));

  const worldContext = { mode, states: gameStates, control };

  return {
    state: activeState || null,
    mode,
    states: gameStates,
    control,
    context: worldContext,
    controller,
  };
}

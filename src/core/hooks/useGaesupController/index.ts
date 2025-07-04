import { useGaesupStore } from '@stores/gaesupStore';
import { UseGaesupControllerResult } from './types';
import { useStateEngine } from '../../motions/hooks/useStateEngine';

export function useGaesupController(): UseGaesupControllerResult {
  const { activeState, gameStates } = useStateEngine();
  const worldContext = useGaesupStore((state) => ({
    mode: state.mode,
    states: gameStates,
    control: state.control,
  }));

  const controllerContext = useGaesupStore();

  return {
    state: activeState || null,
    mode: worldContext.mode,
    states: worldContext.states,
    control: worldContext.control,
    context: worldContext,
    controller: controllerContext,
  };
}

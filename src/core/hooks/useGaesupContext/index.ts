import { useGaesupStore } from '../../stores/gaesupStore';
import { useStateSystem } from '../../motions/hooks/useStateSystem';

export function useGaesupContext() {
  const { activeState, gameStates } = useStateSystem();
  const store = useGaesupStore();
  
  return {
    activeState,
    states: gameStates,
    sizes: store.sizes,
    mode: store.mode,
    control: store.control,
    urls: store.urls,
    minimap: store.minimap,
    animationState: store.animationState,
  };
} 
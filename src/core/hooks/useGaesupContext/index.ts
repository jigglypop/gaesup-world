import { useGaesupStore } from '../../stores/gaesupStore';
import { useStateEngine } from '../../motions/hooks/useStateEngine';

export function useGaesupContext() {
  const { activeState, gameStates } = useStateEngine();
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
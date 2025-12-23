import { useStateSystem } from '../../motions/hooks/useStateSystem';
import { useGaesupStore } from '../../stores/gaesupStore';
import { useUIConfigStore } from '../../ui/stores/UIConfigStore';

export function useGaesupContext() {
  const { activeState, gameStates } = useStateSystem();
  const store = useGaesupStore();
  const minimap = useUIConfigStore((state) => state.config.minimap);
  
  return {
    activeState,
    states: gameStates,
    sizes: store.sizes,
    mode: store.mode,
    control: store.controllerOptions,
    urls: store.urls,
    minimap,
    animationState: store.animationState,
  };
} 
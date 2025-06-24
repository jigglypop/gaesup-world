import { useGaesupStore } from '../../stores/gaesupStore';

export const useGaesupContext = () => {
  const store = useGaesupStore();
  return {
    activeState: store.activeState,
    mode: store.mode,
    animationState: store.animationState,
    states: store.states,
    urls: store.urls,
    rideable: store.rideable,
    block: store.block,
    cameraOption: store.cameraOption,
    minimap: store.minimap,
  };
}; 
import { useGaesupStore } from '@stores/gaesupStore';
import { useGaesupGltf } from '../entities/useGaesupGltf';

export function usePhysics() {
  const store = useGaesupStore();
  const interaction = useGaesupStore((state) => state.interaction);
  const updateKeyboard = useGaesupStore((state) => state.updateKeyboard);
  const updateMouse = useGaesupStore((state) => state.updateMouse);
  const urls = useGaesupStore((state) => state.urls);
  const activeState = useGaesupStore((state) => state.activeState);
  const block = useGaesupStore((state) => state.block);
  const { getSizesByUrls } = useGaesupGltf();
  const isReady = !!(interaction && urls && activeState);
  return {
    worldContext: store,
    activeState,
    input: {
      keyboard: interaction?.keyboard,
      mouse: interaction?.mouse,
    },
    urls,
    setKeyboardInput: updateKeyboard,
    setMouseInput: updateMouse,
    getSizesByUrls,
    isReady,
    blockControl: block?.control,
  };
}

import { useGaesupStore } from '@stores/gaesupStore';
import { useGaesupGltf } from '../entities/useGaesupGltf';

export function usePhysics() {
  const store = useGaesupStore();
  const inputSystem = useGaesupStore((state) => state.input);
  const setKeyboardInput = useGaesupStore((state) => state.setKeyboard);
  const setPointerInput = useGaesupStore((state) => state.setPointer);
  const urls = useGaesupStore((state) => state.urls);
  const activeState = useGaesupStore((state) => state.activeState);
  const block = useGaesupStore((state) => state.block);
  const { getSizesByUrls } = useGaesupGltf();
  const isReady = !!(inputSystem && urls && activeState);
  return {
    worldContext: store,
    activeState,
    input: {
      keyboard: inputSystem?.keyboard,
      mouse: inputSystem?.pointer,
    },
    urls,
    setKeyboardInput,
    setMouseInput: setPointerInput,
    getSizesByUrls,
    isReady,
    blockControl: block?.control,
  };
}

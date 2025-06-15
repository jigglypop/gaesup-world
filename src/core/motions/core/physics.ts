import { useGaesupGltf } from '@utils/gltf';
import { StoreState, useGaesupStore } from '@stores/gaesupStore';

export function usePhysics() {
  const store = useGaesupStore();
  const {
    input: inputSystem,
    setKeyboard: setKeyboardInput,
    setPointer: setPointerInput,
    urls,
    activeState,
    updateState,
    block,
  } = store;
  const { getSizesByUrls } = useGaesupGltf();
  const isReady = !!(inputSystem && urls && activeState && updateState);

  const dispatch = (payload: Partial<StoreState>) => {
    updateState(payload);
  };

  return {
    worldContext: store,
    activeState,
    input: {
      keyboard: inputSystem?.keyboard,
      mouse: inputSystem?.pointer,
    },
    urls,
    dispatch,
    setKeyboardInput,
    setMouseInput: setPointerInput,
    getSizesByUrls,
    isReady,
    blockControl: block?.control,
  };
}

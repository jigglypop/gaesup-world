import { useAtomValue, useSetAtom } from 'jotai';
import { inputAtom, keyboardInputAtom, pointerInputAtom } from '../../atoms';
import { useGaesupContext, useGaesupDispatch } from '../../atoms';
import { useGaesupGltf } from '../../utils/gltf';
import { useGaesupStore } from '../../stores/gaesupStore';

export function usePhysics() {
  const inputSystem = useAtomValue(inputAtom);
  const setKeyboardInput = useSetAtom(keyboardInputAtom);
  const setPointerInput = useSetAtom(pointerInputAtom);
  const urls = useGaesupStore((state) => state.urls);
  const worldContext = useGaesupContext();
  const dispatch = useGaesupDispatch();
  const { getSizesByUrls } = useGaesupGltf();
  const isReady = !!(inputSystem && urls && worldContext && dispatch);

  return {
    worldContext,
    activeState: worldContext?.activeState,
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
  };
}

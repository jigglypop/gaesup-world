import { useAtomValue, useSetAtom } from 'jotai';
import { inputAtom, keyboardInputAtom, pointerInputAtom, blockAtom, urlsAtom } from '../../atoms';
import { useGaesupContext, useGaesupDispatch } from '../../atoms';
import { useGaesupGltf } from '../../utils/gltf';

export function usePhysics() {
  const inputSystem = useAtomValue(inputAtom);
  const setKeyboardInput = useSetAtom(keyboardInputAtom);
  const setPointerInput = useSetAtom(pointerInputAtom);
  const urls = useAtomValue(urlsAtom);
  const block = useAtomValue(blockAtom);
  const worldContext = useGaesupContext();
  const dispatch = useGaesupDispatch();
  const { getSizesByUrls } = useGaesupGltf();

  const isReady = !!(inputSystem && urls && block !== undefined && worldContext && dispatch);

  return {
    worldContext,
    activeState: worldContext?.activeState,
    input: {
      keyboard: inputSystem?.keyboard,
      mouse: inputSystem?.pointer,
    },
    urls,
    blockControl: block?.control || false,
    dispatch,
    setKeyboardInput,
    setMouseInput: setPointerInput,
    getSizesByUrls,
    isReady,
  };
}

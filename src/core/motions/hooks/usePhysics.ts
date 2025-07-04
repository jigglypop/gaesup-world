import { useGaesupStore } from '@stores/gaesupStore';
import { StoreState } from '../../stores/types';
import { SizesType } from '../../stores/slices/sizes';
import { ActiveStateType } from '../core/types';
import { PhysicsCalculationProps } from '../types';
import { useGaesupGltf } from './useGaesupGltf';
import { useStateEngine } from './useStateEngine';

export interface UsePhysicsReturn {
  worldContext: StoreState;
  activeState: ActiveStateType | null;
  input: {
    keyboard: PhysicsCalculationProps['keyboard'] | undefined;
    mouse: PhysicsCalculationProps['mouse'] | undefined;
  };
  urls: StoreState['urls'];
  setKeyboardInput: (input: Partial<PhysicsCalculationProps['keyboard']>) => void;
  setMouseInput: (input: Partial<PhysicsCalculationProps['mouse']>) => void;
  getSizesByUrls: () => SizesType | undefined;
  isReady: boolean;
  blockControl: boolean | undefined;
  dispatch?: (action: { type: string; payload?: unknown }) => void;
}

export function usePhysics(): UsePhysicsReturn {
  const { activeState } = useStateEngine();
  const interaction = useGaesupStore((state) => state.interaction);
  const updateKeyboard = useGaesupStore((state) => state.updateKeyboard);
  const updateMouse = useGaesupStore((state) => state.updateMouse);
  const urls = useGaesupStore((state) => state.urls);
  const block = useGaesupStore((state) => state.block);
  const { getSizesByUrls } = useGaesupGltf();
  const isReady = !!(interaction && urls && activeState);
  return {
    worldContext: useGaesupStore.getState(),
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
import { useGaesupStore } from '@stores/gaesupStore';
import { StoreState } from '../../stores/types';
import { SizesType } from '../../stores/slices/sizes';
import { ActiveStateType } from '../core/types';
import { PhysicsCalculationProps } from '../types';
import { useGaesupGltf } from './useGaesupGltf';
import { useStateEngine } from './useStateEngine';
import { InteractionEngine } from '../../interactions/core/InteractionEngine';

export interface UsePhysicsReturn {
  worldContext: StoreState;
  activeState: ActiveStateType | null;
  input: {
    keyboard: PhysicsCalculationProps['keyboard'] | undefined;
    mouse: PhysicsCalculationProps['mouse'] | undefined;
    rigidBodyRef: any;
  };
  interaction: any;
  urls: StoreState['urls'];
  blockControl: boolean | undefined;
  block: any;
  getSizesByUrls: () => SizesType | undefined;
  setKeyboardInput: (input: Partial<PhysicsCalculationProps['keyboard']>) => void;
  setMouseInput: (input: Partial<PhysicsCalculationProps['mouse']>) => void;
  dispatch?: (action: { type: string; payload?: unknown }) => void;
  isReady: boolean;
}

export function usePhysics(): UsePhysicsReturn {
  const { activeState } = useStateEngine();
  const interactionEngine = InteractionEngine.getInstance();
  const interaction = interactionEngine.getStateRef();
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
      keyboard: interaction.keyboard,
      mouse: interaction.mouse,
      rigidBodyRef: { current: null } as any,
    },
    interaction,
    urls,
    blockControl: block?.control || false,
    block,
    getSizesByUrls,
    setKeyboardInput: (input: Partial<typeof interaction.keyboard>) => {
      interactionEngine.updateKeyboard(input);
    },
    setMouseInput: (input: Partial<typeof interaction.mouse>) => {
      interactionEngine.updateMouse(input);
    },
    dispatch: (action: { type: string; payload?: unknown }) => {
    },
    isReady,
  };
} 
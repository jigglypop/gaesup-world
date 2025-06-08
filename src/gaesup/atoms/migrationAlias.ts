export {
  useActiveStateAtom as useAtom,
  useActiveStateAtom,
  useGameStatesAtom,
  useKeyboardInputAtom,
  usePointerInputAtom,
  useModeStateAtom,
  useAnimationStateAtom,
  useCameraOptionAtom,
  useUrlsStateAtom,
  useSizesStateAtom,
  useBlockStateAtom,
  useClickerOptionAtom,
  useCurrentControllerConfigAtom,
  useAtomValue,
  useSetAtom,
  useAtom as useAtomCompat,
} from '../hooks/compatibility';

export {
  usePhysicsState,
  useGameStates,
  useInputState,
  useMovementState,
  useModeState,
  useAnimationState,
  useCameraOption,
} from '../hooks/useValtio';

export { gameStore, gameActions } from '../store';

export const activeStateAtom = 'DEPRECATED_USE_VALTIO';
export const gameStatesAtom = 'DEPRECATED_USE_VALTIO';
export const modeStateAtom = 'DEPRECATED_USE_VALTIO';
export const urlsStateAtom = 'DEPRECATED_USE_VALTIO';
export const sizesStateAtom = 'DEPRECATED_USE_VALTIO';
export const animationStateAtom = 'DEPRECATED_USE_VALTIO';
export const controllerConfigAtom = 'DEPRECATED_USE_VALTIO';
export const rideableStateAtom = 'DEPRECATED_USE_VALTIO';
export const minimapAtom = 'DEPRECATED_USE_VALTIO';

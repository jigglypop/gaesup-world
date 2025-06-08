import { useSnapshot } from 'valtio';
import { gameStore } from '../../store/gameStore';
import { gaesupPassivePropsType } from './types';

export function useGaesupController(): gaesupPassivePropsType {
  const mode = useSnapshot(gameStore.ui.mode);
  const urls = useSnapshot(gameStore.resources.urls);
  const animation = useSnapshot(gameStore.ui.animation);

  const currentAnimation =
    mode.type && animation ? (animation as any)[mode.type]?.current || 'idle' : 'idle';

  return {
    state: gameStore.physics.activeState,
    mode: mode as any,
    urls: urls as any,
    currentAnimation,
  };
}

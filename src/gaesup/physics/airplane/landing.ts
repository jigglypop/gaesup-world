import { gameStore } from '../../store/gameStore';
import { PhysicsState } from '../types';

export default function landing(physicsState: PhysicsState) {
  const { gameStates } = physicsState;
  const { isRiding } = gameStates;

  if (isRiding) {
    // gameStore에 직접 업데이트
    Object.assign(gameStore.gameStates, {
      isRiding: false,
      canRide: false,
      shouldEnterRideable: false,
      shouldExitRideable: true,
    });
  }
}

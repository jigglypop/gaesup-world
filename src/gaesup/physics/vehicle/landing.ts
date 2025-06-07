import { eventBus } from '../stores';
import { PhysicsState } from '../type';

export default function landing(physicsState: PhysicsState) {
  const { gameStates } = physicsState;
  const { isRiding } = gameStates;

  if (isRiding) {
    eventBus.emit('RIDE_STATE_CHANGE', {
      isRiding: false,
      canRide: false,
      shouldEnterRideable: false,
      shouldExitRideable: true,
    });
  }
}

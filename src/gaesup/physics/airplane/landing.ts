import { physicsEventBus } from '../stores/physicsEventBus';
import { PhysicsState } from '../type';

export default function landing(physicsState: PhysicsState) {
  const { gameStates } = physicsState;
  const { isRiding } = gameStates;

  if (isRiding) {
    // Physics에서는 상태만 업데이트, rideable과 mode 조작은 UI 레벨에서 처리
    physicsEventBus.emit('RIDE_STATE_CHANGE', {
      isRiding: false,
      canRide: false,
      shouldEnterRideable: false,
      shouldExitRideable: true,
    });
  }
}

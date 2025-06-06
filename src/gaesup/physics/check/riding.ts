import { physicsEventBus } from '../stores/physicsEventBus';
import { calcType } from '../type';

const keyStateCache = new Map<string, { lastKeyE: boolean; lastKeyR: boolean }>();

export default function riding(prop: calcType, instanceId: string = 'default') {
  const { inputRef } = prop;
  if (!inputRef || !inputRef.current) {
    return;
  }
  if (!keyStateCache.has(instanceId)) {
    keyStateCache.set(instanceId, { lastKeyE: false, lastKeyR: false });
  }
  const keyState = keyStateCache.get(instanceId)!;
  const keyE = inputRef.current.keyboard.keyE;
  const keyR = inputRef.current.keyboard.keyR;
  if (!keyStateCache.has('logged')) {
    keyStateCache.set('logged', { lastKeyE: false, lastKeyR: false });
  }
  if (keyE && !keyState.lastKeyE) {
    physicsEventBus.emit('RIDE_STATE_CHANGE', {
      isRiding: false,
      canRide: true,
      shouldEnterRideable: true,
      shouldExitRideable: false,
    });
  }
  if (keyR && !keyState.lastKeyR) {
    physicsEventBus.emit('RIDE_STATE_CHANGE', {
      isRiding: false,
      canRide: false,
      shouldEnterRideable: false,
      shouldExitRideable: true,
    });
  }
  keyState.lastKeyE = keyE;
  keyState.lastKeyR = keyR;
}

import { eventBus } from '../stores';
import { PhysicsState } from '../type';
import { getCachedTrig, shouldUpdate } from '../../utils/memoization';

let lastEulerY = 0;

export default function direction(physicsState: PhysicsState, controlMode?: string) {
  const { activeState, keyboard } = physicsState;
  const { forward, backward, leftward, rightward } = keyboard;
  const xAxis = Number(leftward) - Number(rightward);
  const zAxis = Number(forward) - Number(backward);
  
  if (xAxis !== 0) {
    if (controlMode === 'chase') {
      activeState.euler.y += xAxis * (Math.PI / 120);
    } else {
      activeState.euler.y += xAxis * (Math.PI / 64);
    }
    
    if (shouldUpdate(activeState.euler.y, lastEulerY, 0.001)) {
      eventBus.emit('ROTATION_UPDATE', {
        euler: activeState.euler,
        direction: activeState.direction,
        dir: activeState.dir,
      });
      lastEulerY = activeState.euler.y;
    }
  }

  const { sin: sinY, cos: cosY } = getCachedTrig(activeState.euler.y);
  activeState.direction.set(sinY * zAxis, 0, cosY * zAxis);
  activeState.dir.copy(activeState.direction).normalize();
}

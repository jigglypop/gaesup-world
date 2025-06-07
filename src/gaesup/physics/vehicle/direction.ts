import { eventBus } from '../stores';
import { PhysicsState } from '../type';

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
    eventBus.emit('ROTATION_UPDATE', {
      euler: activeState.euler,
      direction: activeState.direction,
      dir: activeState.dir,
    });
  }

  activeState.direction.set(
    Math.sin(activeState.euler.y) * zAxis,
    0,
    Math.cos(activeState.euler.y) * zAxis,
  );
  activeState.dir.copy(activeState.direction).normalize();
}

import { physicsEventBus } from '../stores/physicsEventBus';
import { PhysicsState } from '../type';

export default function direction(physicsState: PhysicsState) {
  const { activeState, keyboard } = physicsState;
  const { forward, backward, leftward, rightward } = keyboard;
  const xAxis = Number(leftward) - Number(rightward);
  const zAxis = Number(forward) - Number(backward);

  // 회전이 있을 때만 처리
  if (xAxis !== 0) {
    activeState.euler.y += xAxis * (Math.PI / 64);

    // ROTATION_UPDATE 이벤트 발행하여 카메라에 알림
    physicsEventBus.emit('ROTATION_UPDATE', {
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

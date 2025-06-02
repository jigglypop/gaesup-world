import { ThreeEvent } from '@react-three/fiber';
import { useContext } from 'react';
import { V3 } from '../../utils';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../../world/context';

export function useClicker() {
  const { activeState, mode, clicker } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const moveClicker = (e: ThreeEvent<MouseEvent>, isRun: boolean, type: 'normal' | 'ground') => {
    if (type !== 'ground') return;
    const u = activeState.position;
    const v = V3(e.point.x, e.point.y, e.point.z);
    const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
    
    // 클릭한 지점의 실제 Y 좌표 사용 (최소 0.5 높이 보장)
    const targetY = Math.max(v.y + 0.5, 0.5);
    
    dispatch({
      type: 'update',
      payload: {
        clicker: {
          ...clicker,
          point: V3(v.x, targetY, v.z),
          angle: newAngle,
          isOn: true,
          isRun: isRun,
        },
      },
    });
  };

  return {
    moveClicker,
  };
}

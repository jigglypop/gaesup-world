import { ThreeEvent } from '@react-three/fiber';
import { useContext } from 'react';
import { useSetAtom } from 'jotai';
import { V3 } from '../../utils';
import { GaesupWorldContext } from '../../world/context';
// 새로운 통합 입력 시스템만 사용
import { pointerInputAtom } from '../../atoms/unifiedInputAtom';

export function useClicker() {
  // === activeState만 Context에서 가져오기 (위치 정보 필요) ===
  const { activeState } = useContext(GaesupWorldContext);
  
  // === 새로운 통합 시스템만 사용 ===
  const setMouseInput = useSetAtom(pointerInputAtom);
  
  const moveClicker = (e: ThreeEvent<MouseEvent>, isRun: boolean, type: 'normal' | 'ground') => {
    if (type !== 'ground') return;
    
    const u = activeState.position; // Context에서 현재 위치 가져오기
    const v = V3(e.point.x, e.point.y, e.point.z);
    const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
    
    // 클릭한 지점의 실제 Y 좌표 사용 (최소 0.5 높이 보장)
    const targetY = Math.max(v.y + 0.5, 0.5);
    const targetPoint = V3(v.x, targetY, v.z);
    
    // === 통합 시스템 업데이트 ===
    setMouseInput({
      target: targetPoint,
      angle: newAngle,
      isActive: true,
      shouldRun: isRun,
    });
  };

  // 클리커 중지 함수
  const stopClicker = () => {
    // === 통합 시스템 업데이트 ===
    setMouseInput({
      isActive: false,
      shouldRun: false,
    });
  };

  return {
    moveClicker,
    stopClicker,
  };
}

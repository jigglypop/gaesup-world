import { useSetAtom } from 'jotai';
// 새로운 통합 입력 시스템만 사용
import { keyboardInputAtom } from '../../atoms/unifiedInputAtom';
import { useCallback } from 'react';

export function usePushKey() {
  // === 새로운 통합 시스템만 사용 ===
  const setKeyboardInput = useSetAtom(keyboardInputAtom);

  const pushKey = (key: string, value: boolean) => {
    // === 키보드 입력 상태 업데이트 ===
    setKeyboardInput({
      [key]: value,
    });
  };

  return {
    pushKey,
  };
}

import { useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { keyboardInputAtom } from '../../atoms/unifiedInputAtom';

// 키 매핑 정의 (게임 표준 키 설정)
const KEY_MAPPING = {
  // WASD 이동 (메인)
  KeyW: 'forward',
  KeyA: 'leftward',
  KeyS: 'backward',
  KeyD: 'rightward',
  // 화살표 키 (보조)
  ArrowUp: 'forward',
  ArrowDown: 'backward',
  ArrowLeft: 'leftward',
  ArrowRight: 'rightward',
  // 공통 키
  Space: 'space',
  ShiftLeft: 'shift',
  ShiftRight: 'shift',
  KeyZ: 'keyZ',
  KeyR: 'keyR',
  KeyF: 'keyF',
  KeyE: 'keyE',
  Escape: 'escape',
} as const;

// 항상 작동해야 하는 키들
const UNIVERSAL_KEYS = Object.keys(KEY_MAPPING);

interface UseKeyboardInputOptions {
  preventDefault?: boolean;
  enabled?: boolean;
}

/**
 * 순수한 키보드 입력 처리 훅
 * 오직 키보드 상태 관리만을 담당
 */
export function useKeyboardInput(options: UseKeyboardInputOptions = {}) {
  const { preventDefault = true, enabled = true } = options;
  const setKeyboardInput = useSetAtom(keyboardInputAtom);
  const pressedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const mappedKey = KEY_MAPPING[event.code as keyof typeof KEY_MAPPING];

      if (mappedKey && !pressedKeys.current.has(event.code)) {
        pressedKeys.current.add(event.code);

        // 스페이스 키 기본 동작 방지 (페이지 스크롤)
        if (preventDefault && event.code === 'Space') {
          event.preventDefault();
        }

        // 키보드 입력 상태 업데이트
        setKeyboardInput({ [mappedKey]: true });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const mappedKey = KEY_MAPPING[event.code as keyof typeof KEY_MAPPING];

      if (mappedKey && pressedKeys.current.has(event.code)) {
        pressedKeys.current.delete(event.code);

        // 키보드 입력 상태 업데이트
        setKeyboardInput({ [mappedKey]: false });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 페이지가 숨겨졌을 때 모든 키 상태 초기화
        pressedKeys.current.clear();
        setKeyboardInput({
          forward: false,
          backward: false,
          leftward: false,
          rightward: false,
          shift: false,
          space: false,
          keyZ: false,
          keyR: false,
          keyF: false,
          keyE: false,
          escape: false,
        });
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, preventDefault, setKeyboardInput]);

  return {
    pressedKeys: Array.from(pressedKeys.current),
    isEnabled: enabled,
  };
}

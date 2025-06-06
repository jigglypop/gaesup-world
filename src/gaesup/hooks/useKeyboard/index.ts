import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { clickerAtom } from '../../atoms';
import { keyboardInputAtom, pointerInputAtom } from '../../atoms/inputAtom';
import { KEY_MAPPING } from '../../tools/constants';

export function useKeyboard() {
  const clicker = useAtomValue(clickerAtom);
  const setClicker = useSetAtom(clickerAtom);
  const setKeyboardInput = useSetAtom(keyboardInputAtom);
  const setPointerInput = useSetAtom(pointerInputAtom);
  const pressedKeys = useRef<Set<string>>(new Set());
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const mappedKey = KEY_MAPPING[event.code as keyof typeof KEY_MAPPING];

      if (mappedKey && !pressedKeys.current.has(event.code)) {
        // 모든 키가 항상 작동 (컨트롤러 모드 무관)
        pressedKeys.current.add(event.code);

        // 스페이스 키 특별 처리 (페이지 스크롤 방지)
        if (event.code === 'Space') {
          event.preventDefault();
        }

        // S키로 clicker 중지 (physics에서 이동한 로직)
        if (event.code === 'KeyS' && clicker.isOn) {
          // clicker 중지
          setClicker({
            ...clicker,
            isOn: false,
            isRun: false,
          });

          // mouse input 시스템도 업데이트
          setPointerInput({
            isActive: false,
            shouldRun: false,
          });
        }

        // === 키보드 입력 상태 업데이트 ===
        setKeyboardInput({
          [mappedKey]: true,
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const mappedKey = KEY_MAPPING[event.code as keyof typeof KEY_MAPPING];

      if (mappedKey && pressedKeys.current.has(event.code)) {
        pressedKeys.current.delete(event.code);

        // === 키보드 입력 상태 업데이트 ===
        setKeyboardInput({
          [mappedKey]: false,
        });
      }
    };

    // 키보드 이벤트 리스너 등록
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [clicker, setClicker, setKeyboardInput, setPointerInput]);

  // visibility change 처리 (탭 전환 시 키 상태 초기화)
  useEffect(() => {
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

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setKeyboardInput]);

  return {
    pressedKeys: Array.from(pressedKeys.current),
  };
}

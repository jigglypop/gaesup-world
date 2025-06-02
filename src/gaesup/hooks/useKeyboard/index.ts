import { useContext, useEffect, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../../world/context';
import { clickerAtom } from '../../atoms';

// 키 매핑 정의 (게임 표준 키 설정)
const KEY_MAPPING = {
  // WASD 이동 (메인)
  'KeyW': 'forward',
  'KeyA': 'leftward', 
  'KeyS': 'backward',
  'KeyD': 'rightward',
  // 화살표 키 (보조)
  'ArrowUp': 'forward',
  'ArrowDown': 'backward', 
  'ArrowLeft': 'leftward',
  'ArrowRight': 'rightward',
  // 공통 키
  'Space': 'space',
  'ShiftLeft': 'shift',
  'ShiftRight': 'shift',
  'KeyZ': 'keyZ',
  'KeyR': 'keyR',
  'KeyF': 'keyF', // 상호작용 키 추가
  'KeyE': 'keyE', // 사용 키 추가
  'Escape': 'escape', // ESC 키 추가
} as const;

// 컨트롤러 모드와 무관하게 항상 작동해야 하는 키들 (모든 키 포함)
const UNIVERSAL_KEYS = [
  // 이동 키
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  // 액션 키
  'Space', 'ShiftLeft', 'ShiftRight', 'KeyZ', 'KeyR', 'KeyF', 'KeyE', 'Escape'
];

export function useKeyboard() {
  const { control, mode } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const clicker = useAtomValue(clickerAtom);
  const setClicker = useSetAtom(clickerAtom);
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
          setClicker({
            ...clicker,
            isOn: false,
            isRun: false,
          });
        }
        
        const newControl = {
          ...control,
          [mappedKey]: true,
        };
        
        dispatch({
          type: 'update',
          payload: {
            control: newControl,
          },
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const mappedKey = KEY_MAPPING[event.code as keyof typeof KEY_MAPPING];
      
      if (mappedKey && pressedKeys.current.has(event.code)) {
        // 모든 키가 항상 작동 (컨트롤러 모드 무관)
        pressedKeys.current.delete(event.code);
        
        const newControl = {
          ...control,
          [mappedKey]: false,
        };
        
        dispatch({
          type: 'update',
          payload: {
            control: newControl,
          },
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pressedKeys.current.clear();
        
        // 모든 키를 false로 리셋
        const resetControl = Object.keys(control).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {} as typeof control);

        dispatch({
          type: 'update',
          payload: {
            control: resetControl,
          },
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [control, dispatch, mode.controller, clicker, setClicker]);

  return {
    pressedKeys: Array.from(pressedKeys.current),
  };
} 
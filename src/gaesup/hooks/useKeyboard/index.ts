import { useContext, useEffect, useRef } from 'react';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../../world/context';

// 키 매핑 정의
const KEY_MAPPING = {
  'ArrowUp': 'forward',
  'ArrowDown': 'backward', 
  'ArrowLeft': 'leftward',
  'ArrowRight': 'rightward',
  'Space': 'space',
  'ShiftLeft': 'shift',
  'ShiftRight': 'shift',
  'KeyZ': 'keyZ',
  'KeyR': 'keyR',
  'KeyS': 'keyS',
} as const;

export function useKeyboard() {
  const { control, mode } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const pressedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 키보드 모드가 아니면 리스너 등록하지 않음
    if (mode.controller !== 'keyboard') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const mappedKey = KEY_MAPPING[event.code as keyof typeof KEY_MAPPING];
      
      if (mappedKey && !pressedKeys.current.has(event.code)) {
        pressedKeys.current.add(event.code);
        
        // 스페이스 키 특별 처리 (페이지 스크롤 방지)
        if (event.code === 'Space') {
          event.preventDefault();
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

    // 포커스 잃었을 때 모든 키 해제
    const handleBlur = () => {
      pressedKeys.current.clear();
      const newControl = { ...control };
      Object.values(KEY_MAPPING).forEach(key => {
        newControl[key] = false;
      });
      
      dispatch({
        type: 'update',
        payload: {
          control: newControl,
        },
      });
    };

    // 이벤트 리스너 등록
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleBlur); // 포커스 시에도 초기화

    // 정리 함수
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleBlur);
      pressedKeys.current.clear();
    };
  }, [control, dispatch, mode.controller]);

  return {
    pressedKeys: Array.from(pressedKeys.current),
  };
} 
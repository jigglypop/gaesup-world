import { useRef, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import * as THREE from 'three';
import { inputSystemAtom, KeyboardInputState, MouseInputState } from '../../atoms/inputSystemAtom';

// Physics 계산용 입력 상태 타입
export interface PhysicsInputState {
  keyboard: KeyboardInputState;
  mouse: MouseInputState;
}

// Physics 계산에서 사용할 통합 입력 Hook
export const usePhysicsInput = () => {
  const inputRef = useRef<PhysicsInputState>({
    keyboard: {
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
    },
    mouse: {
      target: new THREE.Vector3(0, 0, 0),
      angle: Math.PI / 2,
      isActive: false,
      shouldRun: false,
    },
  });

  // atom 상태 구독 (UI 업데이트용)
  const inputSystem = useAtomValue(inputSystemAtom);

  // atom 변경 시 ref 동기화 (Physics 실시간 접근용)
  useEffect(() => {
    inputRef.current = {
      keyboard: { ...inputSystem.keyboard },
      mouse: { 
        ...inputSystem.mouse,
        target: inputSystem.mouse.target.clone(), // Vector3 clone for safety
      },
    };
  }, [inputSystem]);

  // 개발 모드에서 디버깅을 위한 함수들
  const getInputSnapshot = () => ({
    keyboard: { ...inputRef.current.keyboard },
    mouse: { ...inputRef.current.mouse },
    timestamp: Date.now(),
  });

  const isKeyboardActive = () => {
    const kb = inputRef.current.keyboard;
    return kb.forward || kb.backward || kb.leftward || kb.rightward;
  };

  const isMouseActive = () => {
    return inputRef.current.mouse.isActive;
  };

  const getMovementDirection = () => {
    const kb = inputRef.current.keyboard;
    const dirX = Number(kb.leftward) - Number(kb.rightward);
    const dirZ = Number(kb.forward) - Number(kb.backward);
    return { x: dirX, z: dirZ };
  };

  return {
    inputRef,
    // 유틸리티 함수들
    getInputSnapshot,
    isKeyboardActive,
    isMouseActive,
    getMovementDirection,
  };
};

// Physics 계산에서 사용할 타입 export
export type PhysicsInputRef = ReturnType<typeof usePhysicsInput>['inputRef']; 
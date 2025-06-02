import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { inputSystemAtom, movementStateAtom, inputDebugAtom } from '../../atoms/inputSystemAtom';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: number;
}

// 새로운 Input System 검증 Hook
export const useInputValidation = (enableLogging = false) => {
  const inputSystem = useAtomValue(inputSystemAtom);
  const movementState = useAtomValue(movementStateAtom);
  const debugInfo = useAtomValue(inputDebugAtom);
  const lastValidationRef = useRef<ValidationResult | null>(null);

  const validateInputSystem = (): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Keyboard 상태 검증
    const keyboard = inputSystem.keyboard;
    const keyboardKeys = ['forward', 'backward', 'leftward', 'rightward', 'shift', 'space'];
    
    keyboardKeys.forEach(key => {
      if (typeof keyboard[key] !== 'boolean') {
        errors.push(`Keyboard key '${key}' should be boolean, got ${typeof keyboard[key]}`);
      }
    });

    // 2. Mouse 상태 검증
    const mouse = inputSystem.mouse;
    
    if (!mouse.target || typeof mouse.target.x !== 'number') {
      errors.push('Mouse target should be a valid Vector3');
    }
    
    if (typeof mouse.angle !== 'number') {
      errors.push('Mouse angle should be a number');
    }
    
    if (typeof mouse.isActive !== 'boolean') {
      errors.push('Mouse isActive should be boolean');
    }

    // 3. 파생 상태 검증
    const expectedIsMoving = keyboard.forward || keyboard.backward || 
                           keyboard.leftward || keyboard.rightward || mouse.isActive;
    
    if (movementState.isMoving !== expectedIsMoving) {
      warnings.push(`Movement state mismatch: expected ${expectedIsMoving}, got ${movementState.isMoving}`);
    }

    // 4. 논리적 일관성 검증
    if (movementState.isRunning && !movementState.isMoving) {
      warnings.push('Running state is true but not moving');
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      timestamp: Date.now(),
    };

    return result;
  };

  // 실시간 검증 실행
  useEffect(() => {
    const result = validateInputSystem();
    lastValidationRef.current = result;

    if (enableLogging) {
      if (!result.isValid) {
        console.error('Input System Validation Failed:', result.errors);
      }
      if (result.warnings.length > 0) {
        console.warn('Input System Warnings:', result.warnings);
      }
      if (result.isValid && result.warnings.length === 0) {
        console.log('✅ Input System validation passed');
      }
    }
  }, [inputSystem, movementState, enableLogging]);

  // 수동 검증 함수
  const runValidation = () => {
    const result = validateInputSystem();
    lastValidationRef.current = result;
    return result;
  };

  // 현재 상태 스냅샷 반환
  const getStateSnapshot = () => ({
    inputSystem,
    movementState,
    debugInfo,
    validation: lastValidationRef.current,
  });

  return {
    validationResult: lastValidationRef.current,
    runValidation,
    getStateSnapshot,
    isValid: lastValidationRef.current?.isValid ?? false,
  };
};

// 개발 도구: 입력 상태를 콘솔에 출력하는 Hook
export const useInputLogger = (enabled = false, interval = 1000) => {
  const inputSystem = useAtomValue(inputSystemAtom);
  const movementState = useAtomValue(movementStateAtom);

  useEffect(() => {
    if (!enabled) return;

    const logInterval = setInterval(() => {
      console.table({
        'Keyboard Forward': inputSystem.keyboard.forward,
        'Keyboard Backward': inputSystem.keyboard.backward,
        'Keyboard Left': inputSystem.keyboard.leftward,
        'Keyboard Right': inputSystem.keyboard.rightward,
        'Keyboard Shift': inputSystem.keyboard.shift,
        'Keyboard Space': inputSystem.keyboard.space,
        'Mouse Active': inputSystem.mouse.isActive,
        'Mouse Should Run': inputSystem.mouse.shouldRun,
        'Is Moving': movementState.isMoving,
        'Is Running': movementState.isRunning,
        'Input Source': movementState.inputSource,
      });
    }, interval);

    return () => clearInterval(logInterval);
  }, [enabled, interval, inputSystem, movementState]);
}; 
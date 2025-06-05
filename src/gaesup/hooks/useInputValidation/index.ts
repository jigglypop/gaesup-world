import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { unifiedInputAtom, movementStateAtom } from '../../atoms/unifiedInputAtom';

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  performance: {
    responseTime: number;
    accuracy: number;
  };
}

export function useInputValidation(): {
  validate: () => ValidationResult;
  getInputDebug: () => any;
} {
  const inputSystem = useAtomValue(unifiedInputAtom);
  const movementState = useAtomValue(movementStateAtom);

  const validate = (): ValidationResult => {
    const issues: string[] = [];
    let responseTime = 16;
    let accuracy = 1.0;

    const keyboard = inputSystem.keyboard;
    const pointer = inputSystem.pointer;

    if (!keyboard || !pointer) {
      issues.push('Input system not initialized');
      accuracy *= 0.5;
    }

    const contradictoryInputs = (keyboard.forward && keyboard.backward) || 
                               (keyboard.leftward && keyboard.rightward);
    if (contradictoryInputs) {
      issues.push('Contradictory keyboard inputs detected');
      accuracy *= 0.8;
    }

    if (pointer.isActive && !pointer.target) {
      issues.push('Mouse active but no target position');
      accuracy *= 0.9;
    }

    return {
      isValid: issues.length === 0,
      issues,
      performance: {
        responseTime,
        accuracy,
      },
    };
  };

  const getInputDebug = () => ({
    inputSystem,
    movementState,
    validation: validate(),
  });

  return { validate, getInputDebug };
}

export const useInputValidation2 = (enableLogging = false) => {
  const inputSystem = useAtomValue(unifiedInputAtom);
  const movementState = useAtomValue(movementStateAtom);
  const lastValidationRef = useRef<ValidationResult | null>(null);

  const validate = () => {
    const startTime = performance.now();
    const issues: string[] = [];

    if (!inputSystem?.keyboard || !inputSystem?.pointer) {
      issues.push('Input system components missing');
    }

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    const result: ValidationResult = {
      isValid: issues.length === 0,
      issues,
      performance: {
        responseTime,
        accuracy: issues.length === 0 ? 1.0 : 0.8,
      },
    };

    lastValidationRef.current = result;
    return result;
  };

  useEffect(() => {
    if (enableLogging) {
      console.log('Input System State:', {
        inputSystem,
        movementState,
        validation: lastValidationRef.current,
      });
    }
  }, [inputSystem, movementState, enableLogging]);

  return { validate, inputSystem, movementState };
};

export const useInputLogger = (enabled = false, interval = 1000) => {
  const inputSystem = useAtomValue(unifiedInputAtom);
  const movementState = useAtomValue(movementStateAtom);

  useEffect(() => {
    if (!enabled) return;

    const logInterval = setInterval(() => {
      console.group('🎮 Input System Debug');
      console.log('Keyboard State:', inputSystem.keyboard);
      console.log('Pointer State:', inputSystem.pointer);
      console.log('Movement State:', movementState);
      console.log('Timestamps:', {
        'Current': Date.now(),
        'Pointer Active': inputSystem.pointer.isActive,
        'Pointer Should Run': inputSystem.pointer.shouldRun,
      });
      console.groupEnd();
    }, interval);

    return () => clearInterval(logInterval);
  }, [enabled, interval, inputSystem, movementState]);
}; 
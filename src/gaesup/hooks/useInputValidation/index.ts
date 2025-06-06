import { useAtomValue } from 'jotai';
import { useRef } from 'react';
import { inputAtom, movementStateAtom } from '../../atoms/inputAtom';

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
  getInputDebug: () => unknown;
} {
  const inputSystem = useAtomValue(inputAtom);
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

    const contradictoryInputs =
      (keyboard.forward && keyboard.backward) || (keyboard.leftward && keyboard.rightward);
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
  const inputSystem = useAtomValue(inputAtom);
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
  return { validate, inputSystem, movementState };
};

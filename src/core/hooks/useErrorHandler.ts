import { useCallback, useState } from 'react';
import { ErrorType, GaesupError, createGaesupError } from '../error/ErrorBoundary';

export function useErrorHandler() {
  const [errors, setErrors] = useState<GaesupError[]>([]);

  const handleError = useCallback((error: GaesupError) => {
    console.error(`[${error.type}] ${error.code}:`, error.message, error.context);

    if (error.recoverable) {
      switch (error.type) {
        case ErrorType.PHYSICS:
          console.warn('Physics error occurred, attempting recovery...');
          break;
        case ErrorType.RESOURCE:
          console.warn('Resource error occurred, attempting retry...');
          break;
        case ErrorType.STATE:
          console.warn('State error occurred, rolling back...');
          break;
      }
    }

    setErrors((prev) => [...prev.slice(-9), error]);

    if (!error.recoverable) {
      console.error('Unrecoverable error:', error);
    }
  }, []);

  const createError = useCallback(
    (type: ErrorType, code: string, message: string, context?: unknown, recoverable = false) => {
      return createGaesupError(type, code, message, context, recoverable);
    },
    [],
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    handleError,
    createError,
    clearErrors,
  };
}

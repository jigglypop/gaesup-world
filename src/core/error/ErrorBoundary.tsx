import { Component, ReactNode, ErrorInfo } from 'react';

export enum ErrorType {
  PHYSICS = 'PHYSICS',
  RENDER = 'RENDER',
  INPUT = 'INPUT',
  NETWORK = 'NETWORK',
  RESOURCE = 'RESOURCE',
  STATE = 'STATE',
}

export interface GaesupError extends Error {
  type: ErrorType;
  code: string;
  context?: unknown;
  recoverable: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class GaesupErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error, errorInfo: null };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.reportError(error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error }: { error: Error | null }) {
  console.error('ErrorBoundary caught error:', error);
  return (
    <div>
      <h3>앱에서 오류가 발생했습니다</h3>
      <p>콘솔을 확인해주세요</p>
    </div>
  );
}

export function createGaesupError(
  type: ErrorType,
  code: string,
  message: string,
  context?: unknown,
  recoverable = false,
): GaesupError {
  const error = new Error(message) as GaesupError;
  error.type = type;
  error.code = code;
  error.context = context;
  error.recoverable = recoverable;
  return error;
}

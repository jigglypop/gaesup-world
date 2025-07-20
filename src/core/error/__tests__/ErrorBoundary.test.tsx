import React from 'react';
import { render, screen } from '@testing-library/react';
import { GaesupErrorBoundary, ErrorType, createGaesupError } from '../ErrorBoundary';

// Mock child component that can throw errors
const ThrowError = ({ shouldThrow, errorType }: { shouldThrow: boolean; errorType?: string }) => {
  if (shouldThrow) {
    if (errorType === 'render') {
      throw new Error('Render error');
    } else if (errorType === 'physics') {
      throw createGaesupError(ErrorType.PHYSICS, 'PHY001', 'Physics calculation failed');
    } else {
      throw new Error('Test error');
    }
  }
  return <div data-testid="child-component">Child Component</div>;
};

// Mock Sentry
const mockSentry = {
  captureException: jest.fn(),
};

describe('GaesupErrorBoundary', () => {
  let originalWindow: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock window.Sentry
    originalWindow = global.window;
    Object.defineProperty(global, 'window', {
      value: {
        ...originalWindow,
        Sentry: mockSentry,
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.window = originalWindow;
  });

  describe('Normal Rendering', () => {
    test('should render children when no error occurs', () => {
      render(
        <GaesupErrorBoundary>
          <ThrowError shouldThrow={false} />
        </GaesupErrorBoundary>
      );

      expect(screen.getByTestId('child-component')).toBeInTheDocument();
      expect(screen.getByText('Child Component')).toBeInTheDocument();
    });

    test('should render multiple children when no error occurs', () => {
      render(
        <GaesupErrorBoundary>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </GaesupErrorBoundary>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Error Catching', () => {
    test('should catch and display default error fallback', () => {
      render(
        <GaesupErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GaesupErrorBoundary>
      );

      expect(screen.getByText('앱에서 오류가 발생했습니다')).toBeInTheDocument();
      expect(screen.getByText('콘솔을 확인해주세요')).toBeInTheDocument();
      expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    });

    test('should display custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;

      render(
        <GaesupErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </GaesupErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
      expect(screen.queryByText('앱에서 오류가 발생했습니다')).not.toBeInTheDocument();
    });

    test('should catch render errors', () => {
      render(
        <GaesupErrorBoundary>
          <ThrowError shouldThrow={true} errorType="render" />
        </GaesupErrorBoundary>
      );

      expect(screen.getByText('앱에서 오류가 발생했습니다')).toBeInTheDocument();
    });

    test('should catch physics errors', () => {
      render(
        <GaesupErrorBoundary>
          <ThrowError shouldThrow={true} errorType="physics" />
        </GaesupErrorBoundary>
      );

      expect(screen.getByText('앱에서 오류가 발생했습니다')).toBeInTheDocument();
    });
  });

  describe('Error Reporting', () => {
    test('should call onError callback when error occurs', () => {
      const onErrorMock = jest.fn();

      render(
        <GaesupErrorBoundary onError={onErrorMock}>
          <ThrowError shouldThrow={true} />
        </GaesupErrorBoundary>
      );

      expect(onErrorMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    test('should report error to Sentry when available', () => {
      render(
        <GaesupErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GaesupErrorBoundary>
      );

      expect(mockSentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          contexts: expect.objectContaining({
            react: expect.objectContaining({
              componentStack: expect.any(String),
            }),
          }),
        })
      );
    });

    test('should not fail when Sentry is not available', () => {
      // Remove Sentry from window
      Object.defineProperty(global, 'window', {
        value: {
          ...originalWindow,
          Sentry: undefined,
        },
        writable: true,
      });

      expect(() => {
        render(
          <GaesupErrorBoundary>
            <ThrowError shouldThrow={true} />
          </GaesupErrorBoundary>
        );
      }).not.toThrow();

      expect(screen.getByText('앱에서 오류가 발생했습니다')).toBeInTheDocument();
    });

    test('should not fail when window is not available (SSR)', () => {
      // Mock non-browser environment
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      expect(() => {
        render(
          <GaesupErrorBoundary>
            <ThrowError shouldThrow={true} />
          </GaesupErrorBoundary>
        );
      }).not.toThrow();
    });
  });

  describe('Error State Management', () => {
    test('should update error state when error occurs', () => {
      const boundary = render(
        <GaesupErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GaesupErrorBoundary>
      );

      expect(screen.getByText('앱에서 오류가 발생했습니다')).toBeInTheDocument();
    });

    test('should maintain error state after multiple renders', () => {
      const { rerender } = render(
        <GaesupErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GaesupErrorBoundary>
      );

      expect(screen.getByText('앱에서 오류가 발생했습니다')).toBeInTheDocument();

      // Rerender should still show error state
      rerender(
        <GaesupErrorBoundary>
          <ThrowError shouldThrow={false} />
        </GaesupErrorBoundary>
      );

      expect(screen.getByText('앱에서 오류가 발생했습니다')).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    test('should reset error state with new key prop', () => {
      const { rerender } = render(
        <GaesupErrorBoundary key="error-boundary-1">
          <ThrowError shouldThrow={true} />
        </GaesupErrorBoundary>
      );

      expect(screen.getByText('앱에서 오류가 발생했습니다')).toBeInTheDocument();

      // Rerender with new key should reset error boundary
      rerender(
        <GaesupErrorBoundary key="error-boundary-2">
          <ThrowError shouldThrow={false} />
        </GaesupErrorBoundary>
      );

      expect(screen.getByTestId('child-component')).toBeInTheDocument();
      expect(screen.queryByText('앱에서 오류가 발생했습니다')).not.toBeInTheDocument();
    });
  });

  describe('Error Types', () => {
    test('should handle different error types correctly', () => {
      const errorTypes = [
        ErrorType.PHYSICS,
        ErrorType.RENDER,
        ErrorType.INPUT,
        ErrorType.NETWORK,
        ErrorType.RESOURCE,
        ErrorType.STATE,
      ];

      errorTypes.forEach((errorType) => {
        const TestComponent = () => {
          throw createGaesupError(errorType, 'TEST001', `${errorType} error`);
        };

        const { unmount } = render(
          <GaesupErrorBoundary>
            <TestComponent />
          </GaesupErrorBoundary>
        );

        expect(screen.getByText('앱에서 오류가 발생했습니다')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Default Error Fallback', () => {
    test('should log error to console', () => {
      const consoleSpy = jest.spyOn(console, 'error');

      render(
        <GaesupErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GaesupErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught error:',
        expect.any(Error)
      );
    });

    test('should handle null error gracefully', () => {
      // Mock getDerivedStateFromError to return null error
      const originalGetDerivedStateFromError = GaesupErrorBoundary.getDerivedStateFromError;
      GaesupErrorBoundary.getDerivedStateFromError = () => ({
        hasError: true,
        error: null,
        errorInfo: null,
      });

      expect(() => {
        render(
          <GaesupErrorBoundary>
            <ThrowError shouldThrow={true} />
          </GaesupErrorBoundary>
        );
      }).not.toThrow();

      // Restore original method
      GaesupErrorBoundary.getDerivedStateFromError = originalGetDerivedStateFromError;
    });
  });

  describe('createGaesupError utility', () => {
    test('should create error with correct properties', () => {
      const error = createGaesupError(
        ErrorType.PHYSICS,
        'PHY001',
        'Physics calculation failed',
        { object: 'player' },
        true
      );

      expect(error.type).toBe(ErrorType.PHYSICS);
      expect(error.code).toBe('PHY001');
      expect(error.message).toBe('Physics calculation failed');
      expect(error.context).toEqual({ object: 'player' });
      expect(error.recoverable).toBe(true);
    });

    test('should create error with default recoverable value', () => {
      const error = createGaesupError(
        ErrorType.RENDER,
        'REN001',
        'Render failed'
      );

      expect(error.recoverable).toBe(false);
    });

    test('should create error without context', () => {
      const error = createGaesupError(
        ErrorType.INPUT,
        'INP001',
        'Input validation failed'
      );

      expect(error.context).toBeUndefined();
    });
  });

  describe('Component Lifecycle', () => {
    test('should call componentDidCatch when error occurs', () => {
      const componentDidCatchSpy = jest.spyOn(GaesupErrorBoundary.prototype, 'componentDidCatch');

      render(
        <GaesupErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GaesupErrorBoundary>
      );

      expect(componentDidCatchSpy).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );

      componentDidCatchSpy.mockRestore();
    });

    test('should call getDerivedStateFromError when error occurs', () => {
      const getDerivedStateFromErrorSpy = jest.spyOn(GaesupErrorBoundary, 'getDerivedStateFromError');

      render(
        <GaesupErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GaesupErrorBoundary>
      );

      expect(getDerivedStateFromErrorSpy).toHaveBeenCalledWith(expect.any(Error));

      getDerivedStateFromErrorSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    test('should not impact performance when no errors occur', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        const { unmount } = render(
          <GaesupErrorBoundary>
            <ThrowError shouldThrow={false} />
          </GaesupErrorBoundary>
        );
        unmount();
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle multiple error boundaries efficiently', () => {
      render(
        <div>
          {Array.from({ length: 10 }, (_, i) => (
            <GaesupErrorBoundary key={i}>
              <ThrowError shouldThrow={false} />
            </GaesupErrorBoundary>
          ))}
        </div>
      );

      expect(screen.getAllByTestId('child-component')).toHaveLength(10);
    });
  });

  describe('Edge Cases', () => {
    test('should handle async errors gracefully', async () => {
      const AsyncThrowError = () => {
        React.useEffect(() => {
          // Async errors are not caught by error boundaries
          // This test ensures the component doesn't break
          setTimeout(() => {
            console.error('Async error - not caught by boundary');
          }, 10);
        }, []);
        return <div data-testid="async-component">Async Component</div>;
      };

      render(
        <GaesupErrorBoundary>
          <AsyncThrowError />
        </GaesupErrorBoundary>
      );

      expect(screen.getByTestId('async-component')).toBeInTheDocument();
    });

    test('should handle empty children', () => {
      render(<GaesupErrorBoundary>{null}</GaesupErrorBoundary>);

      expect(screen.container.firstChild).toBeEmptyDOMElement();
    });

    test('should handle undefined children', () => {
      render(<GaesupErrorBoundary>{undefined}</GaesupErrorBoundary>);

      expect(screen.container.firstChild).toBeEmptyDOMElement();
    });
  });
}); 
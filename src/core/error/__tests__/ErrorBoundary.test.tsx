import { render, screen } from '@testing-library/react';

import { ErrorType, GaesupErrorBoundary, createGaesupError } from '../ErrorBoundary';

function Throws({ error }: { error: Error }): never {
  throw error;
}

describe('GaesupErrorBoundary', () => {
  beforeEach(() => {
    // React and the default fallback log the caught error; keep the output quiet.
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    delete window.Sentry;
  });

  test('renders its children when nothing throws', () => {
    render(<GaesupErrorBoundary fallback={<p>fallback</p>}><p>content</p></GaesupErrorBoundary>);
    expect(screen.getByText('content')).toBeInTheDocument();
    expect(screen.queryByText('fallback')).toBeNull();
  });

  test('replaces a throwing subtree with the fallback and reports the error once', () => {
    const error = new Error('broken child');
    const onError = jest.fn();
    const captureException = jest.fn();
    window.Sentry = { captureException };

    render(<GaesupErrorBoundary fallback={<p>fallback</p>} onError={onError}><Throws error={error} /></GaesupErrorBoundary>);

    expect(screen.getByText('fallback')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error, expect.objectContaining({ componentStack: expect.any(String) }));
    expect(captureException).toHaveBeenCalledWith(error, {
      contexts: { react: { componentStack: expect.any(String) } },
    });
  });

  test('shows the default fallback without a custom one', () => {
    render(<GaesupErrorBoundary><Throws error={new Error('no fallback')} /></GaesupErrorBoundary>);
    expect(screen.getByRole('heading', { name: '앱에서 오류가 발생했습니다' })).toBeInTheDocument();
  });
});

describe('createGaesupError', () => {
  test('builds an Error carrying type, code, context and recoverability', () => {
    const error = createGaesupError(ErrorType.NETWORK, 'E_TIMEOUT', 'request timed out', { retry: 2 }, true);

    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({ message: 'request timed out', type: ErrorType.NETWORK, code: 'E_TIMEOUT', context: { retry: 2 }, recoverable: true });
    expect(createGaesupError(ErrorType.STATE, 'E_STATE', 'bad state').recoverable).toBe(false);
  });
});

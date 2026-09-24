import { createErrorReportState, reportError, reportThrottled, setErrorSink, type ErrorReportContext } from '../reportError';

describe('reportError', () => {
  it('routes errors to the active sink and restores the previous one', () => {
    const outer = jest.fn();
    const inner = jest.fn();
    const releaseOuter = setErrorSink(outer);
    const releaseInner = setErrorSink(inner);
    reportError('plain', { source: 'test' });
    expect(inner).toHaveBeenCalledWith(new Error('plain'), { source: 'test' });
    releaseInner();
    reportError(new Error('again'), { source: 'test' });
    expect(outer).toHaveBeenCalledTimes(1);
    releaseOuter();
  });

  it('reports the first error, then at most one per second with the skipped count', () => {
    const reports: ErrorReportContext[] = [];
    const release = setErrorSink((_error, context) => reports.push(context));
    const state = createErrorReportState();
    for (let ms = 0; ms < 2500; ms += 100) reportThrottled(state, ms, new Error('tick'), { source: 'frame', label: 'x' });
    release();
    expect(reports).toEqual([
      { source: 'frame', label: 'x' },
      { source: 'frame', label: 'x', suppressed: 9 },
      { source: 'frame', label: 'x', suppressed: 9 },
    ]);
  });

  it('survives a throwing sink', () => {
    const release = setErrorSink(() => { throw new Error('sink broke'); });
    expect(() => reportError(new Error('original'), { source: 'test' })).not.toThrow();
    release();
  });
});

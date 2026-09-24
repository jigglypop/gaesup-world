import { readNodeEnv } from './env';
import { writeErrorReport } from './logger';

export type ErrorReportContext = {
  /** Boundary that caught the error, e.g. `frame:camera` or `clock:physics`. */
  source: string;
  /** Registration label or id of the failing callback. */
  label?: string;
  /** Errors from the same callback that were rate-limited since the previous report. */
  suppressed?: number;
};

export type ErrorSink = (error: Error, context: ErrorReportContext) => void;

export const ERROR_REPORT_INTERVAL_MS = 1000;

const consoleSink: ErrorSink = (error, context) => {
  const label = context.label ? ` (${context.label})` : '';
  const suppressed = context.suppressed ? ` +${context.suppressed} suppressed` : '';
  writeErrorReport(`[gaesup-world] ${context.source}${label}${suppressed}`, error);
};
const silentSink: ErrorSink = () => undefined;

let sink: ErrorSink = readNodeEnv() === 'test' ? silentSink : consoleSink;

/** Replaces the error sink (for example `runtime.onError`); the returned function restores the previous one. */
export function setErrorSink(next: ErrorSink): () => void {
  const previous = sink;
  sink = next;
  return () => {
    if (sink === next) sink = previous;
  };
}

export function reportError(error: unknown, context: ErrorReportContext): void {
  const normalized = error instanceof Error ? error : new Error(String(error));
  try {
    sink(normalized, context);
  } catch (sinkError) {
    consoleSink(sinkError instanceof Error ? sinkError : new Error(String(sinkError)), { source: 'error-sink' });
  }
}

/** Per-callback rate limit: the first error and then at most one report per interval, counting what was skipped. */
export type ErrorReportState = { lastReportMs: number; suppressed: number };

export const createErrorReportState = (): ErrorReportState => ({ lastReportMs: Number.NEGATIVE_INFINITY, suppressed: 0 });

export function reportThrottled(state: ErrorReportState, nowMs: number, error: unknown, context: ErrorReportContext): void {
  if (nowMs >= state.lastReportMs && nowMs - state.lastReportMs < ERROR_REPORT_INTERVAL_MS) {
    state.suppressed++;
    return;
  }
  const suppressed = state.suppressed;
  state.lastReportMs = nowMs;
  state.suppressed = 0;
  reportError(error, suppressed > 0 ? { ...context, suppressed } : context);
}

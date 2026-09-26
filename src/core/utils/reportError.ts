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
/** What a boundary calls with whatever it caught; a runtime hands its own to the boundaries it owns. */
export type ErrorReporter = (error: unknown, context: ErrorReportContext) => void;

export const ERROR_REPORT_INTERVAL_MS = 1000;

const consoleSink: ErrorSink = (error, context) => {
  const label = context.label ? ` (${context.label})` : '';
  const suppressed = context.suppressed ? ` +${context.suppressed} suppressed` : '';
  writeErrorReport(`[gaesup-world] ${context.source}${label}${suppressed}`, error);
};
const silentSink: ErrorSink = () => undefined;

let sink: ErrorSink = readNodeEnv() === 'test' ? silentSink : consoleSink;

/** Replaces the page default sink, which only boundaries no runtime owns use; the returned function restores it. */
export function setErrorSink(next: ErrorSink): () => void {
  const previous = sink;
  sink = next;
  return () => {
    if (sink === next) sink = previous;
  };
}

/** Delivers to `target`; a sink that throws is reported to the console instead of escaping the boundary. */
export function deliverError(target: ErrorSink, error: unknown, context: ErrorReportContext): void {
  const normalized = error instanceof Error ? error : new Error(String(error));
  try {
    target(normalized, context);
  } catch (sinkError) {
    consoleSink(sinkError instanceof Error ? sinkError : new Error(String(sinkError)), { source: 'error-sink' });
  }
}

/** The page default reporter. */
export const reportError: ErrorReporter = (error, context) => deliverError(sink, error, context);

/** Per-callback rate limit: the first error and then at most one report per interval, counting what was skipped. */
export type ErrorReportState = { lastReportMs: number; suppressed: number };

export const createErrorReportState = (): ErrorReportState => ({ lastReportMs: Number.NEGATIVE_INFINITY, suppressed: 0 });

export function reportThrottled(
  state: ErrorReportState,
  nowMs: number,
  error: unknown,
  context: ErrorReportContext,
  report: ErrorReporter = reportError,
): void {
  if (nowMs >= state.lastReportMs && nowMs - state.lastReportMs < ERROR_REPORT_INTERVAL_MS) {
    state.suppressed++;
    return;
  }
  const suppressed = state.suppressed;
  state.lastReportMs = nowMs;
  state.suppressed = 0;
  report(error, suppressed > 0 ? { ...context, suppressed } : context);
}

// No imports: index.html runs this module script before the app's, so react-dom finds the hook when it evaluates.

type DevtoolsHook = {
  supportsFiber?: boolean;
  inject?: (renderer: unknown) => number;
  onCommitFiberRoot?: (...args: unknown[]) => void;
};
declare global {
  interface Window { __REACT_DEVTOOLS_GLOBAL_HOOK__?: DevtoolsHook }
}

const counters = { commits: 0, longTasks: 0, longTaskMs: 0, requests: 0 };
let installed = false;

/**
 * Counts React commits (DOM and R3F roots) through the devtools hook, which production React also calls, plus long
 * tasks and completed requests. Wraps an existing hook (React DevTools, React Refresh) instead of replacing it.
 */
function install(): void {
  installed = true;
  let renderers = 0;
  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ??= { supportsFiber: true, inject: () => ++renderers, onCommitFiberRoot: () => {} };
  const commit = hook.onCommitFiberRoot;
  hook.onCommitFiberRoot = function (...args) { counters.commits++; commit?.apply(this, args); };
  if (typeof PerformanceObserver !== 'function') return;
  const observe = (type: string, record: (entry: PerformanceEntry) => void) => {
    if (!PerformanceObserver.supportedEntryTypes.includes(type)) return;
    new PerformanceObserver((list) => { for (const entry of list.getEntries()) record(entry); }).observe({ type, buffered: true });
  };
  observe('longtask', (entry) => { counters.longTasks++; counters.longTaskMs += entry.duration; });
  observe('resource', () => { counters.requests++; });
}

if (location.pathname.slice(import.meta.env.BASE_URL.length).startsWith('accept')) install();

/** Whether this page counts commits and requests (only the /accept route does). */
export function instrumented(): boolean {
  return installed;
}

/** Cumulative page counters; scenarios diff two reads. */
export function pageCounters(): Readonly<typeof counters> {
  return { ...counters };
}

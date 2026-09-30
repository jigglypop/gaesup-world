type ResettableStore = {
  getState: () => object;
  getInitialState?: () => object;
  setState?: (state: object, replace: true) => void;
};

/**
 * A zustand store's construction state as a domain reset, or undefined when the store cannot restore it.
 * A reset is a restore: stores that count restores in `hydrationRevision` advance it, so trackers ignore the write.
 */
export function createStoreReset(store: object): (() => void) | undefined {
  const api = store as ResettableStore;
  const { getInitialState, setState } = api;
  if (typeof getInitialState !== 'function' || typeof setState !== 'function') return undefined;
  return () => {
    const { hydrationRevision } = api.getState() as { hydrationRevision?: unknown };
    const initial = getInitialState();
    setState(typeof hydrationRevision === 'number' ? { ...initial, hydrationRevision: hydrationRevision + 1 } : initial, true);
  };
}

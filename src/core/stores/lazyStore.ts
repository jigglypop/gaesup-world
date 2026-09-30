import { useStore, type StoreApi, type UseBoundStore } from 'zustand';

/** A zustand bound store: the React hook carrying the static store API. */
export type BoundStore = UseBoundStore<StoreApi<unknown>>;

/** Default hook selector, shared like zustand's own so hook calls without a selector keep a stable snapshot getter. */
export const selectState = (state: unknown): unknown => state;

/**
 * A module-scope store that importing does not create: the hook and the static API (getState, setState, subscribe,
 * getInitialState) create it on first access, and every later access reaches that same store.
 */
export function lazyStore<S extends BoundStore>(create: () => S): S {
  let store: S | undefined;
  const get = (): S => (store ??= create());
  function useLazyStore(selector = selectState) {
    return useStore(get(), selector);
  }
  return Object.assign(useLazyStore, {
    getState: () => get().getState(),
    getInitialState: () => get().getInitialState(),
    setState: (...args: unknown[]): void => Reflect.apply(get().setState, undefined, args),
    subscribe: (...args: unknown[]): (() => void) => Reflect.apply(get().subscribe, undefined, args),
  }) as unknown as S;
}

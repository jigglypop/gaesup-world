import { useStore, type StoreApi, type UseBoundStore } from 'zustand';

/** Keep the public static API while React reads and subscribes to its owning world. */
export function createScopedStoreHook<T>(
  legacy: UseBoundStore<StoreApi<T>>,
  useOwnedStore: () => UseBoundStore<StoreApi<T>> | undefined,
) {
  const useStoreApi = (): UseBoundStore<StoreApi<T>> => useOwnedStore() ?? hook;
  function useScoped(): T;
  function useScoped<S>(selector: (state: T) => S): S;
  function useScoped(selector: (state: T) => unknown = state => state) {
    return useStore(useStoreApi(), selector);
  }
  const hook = Object.assign(useScoped, legacy);
  return { useStore: hook, useStoreApi };
}

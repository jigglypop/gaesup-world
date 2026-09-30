declare const serviceValue: unique symbol;

/** A service id that carries its value type. Registration and lookup share one key, so ids cannot drift apart. */
export type ServiceKey<TValue> = string & { readonly [serviceValue]?: TValue };

export function defineService<TValue>(id: string): ServiceKey<TValue> {
  return id as ServiceKey<TValue>;
}

/** Key of the per-runtime store a `GaesupRuntime` registers for a domain. */
export function runtimeStoreServiceKey<TStore>(domain: string): ServiceKey<TStore> {
  return defineService<TStore>(`gaesup.runtime.${domain}-store`);
}

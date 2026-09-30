/** Deep copy of plain save data. Legacy environments use the JSON value contract of LocalStorageAdapter. */
export function clonePlainData<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

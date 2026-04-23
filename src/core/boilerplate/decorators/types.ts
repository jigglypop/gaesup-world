
export type LoggingOptions = {
  enablePerformanceLog?: boolean;
  enableMemoryLog?: boolean;
  logInterval?: number;
};

export type DecoratorTarget = object;
export type DecoratedValue =
  | object
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

export type AnyConstructor<T = object> = new (...args: never[]) => T;

export type PropertyDescriptorExtended = PropertyDescriptor & {
  value?: ((...args: never[]) => void | DecoratedValue) | undefined;
};

export type PerformanceMemory = {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
};

export type PerformanceWithMemory = Performance & {
  memory?: PerformanceMemory;
};


/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-function-type */

export type LoggingOptions = {
  enablePerformanceLog?: boolean;
  enableMemoryLog?: boolean;
  logInterval?: number;
};

export type DecoratorTarget = object;

export type AnyConstructor<T = object> = new (...args: any[]) => T;

export type PropertyDescriptorExtended = PropertyDescriptor & {
  value?: Function;
};

export type PerformanceMemory = {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
};

export type PerformanceWithMemory = Performance & {
  memory?: PerformanceMemory;
};

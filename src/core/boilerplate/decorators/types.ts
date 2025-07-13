
export type LoggingOptions = {
  enablePerformanceLog?: boolean;
  enableMemoryLog?: boolean;
  logInterval?: number;
};

export type DecoratorTarget = object;

export type PropertyDescriptorExtended = PropertyDescriptor & {
  value?: (...args: unknown[]) => unknown;
};

export type PerformanceMemory = {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
};

export type PerformanceWithMemory = Performance & {
  memory?: PerformanceMemory;
};

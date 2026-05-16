import 'reflect-metadata';
import type { DecoratedValue } from './types';
type Constructor<T = object> = new (...args: DecoratedValue[]) => T;
export declare function Validate(): (target: object, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function DebugLog(): (target: object, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function PerformanceLog(): (target: object, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function EnableEventLog(): (...args: Array<object | string>) => void;
export declare function Singleton<T extends Constructor>(target: T): T;
export {};

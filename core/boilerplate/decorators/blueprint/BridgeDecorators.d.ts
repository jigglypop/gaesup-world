import 'reflect-metadata';
import type { ServiceTarget } from '../../types';
export declare function DomainBridge(domain: string): <T extends ServiceTarget<object>>(target: T) => void;
export declare function Command(name: string): (target: object, propertyKey: string) => void;
export declare function EnableMetrics(): <T extends ServiceTarget<object>>(target: T) => void;

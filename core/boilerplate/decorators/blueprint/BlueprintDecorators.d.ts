import 'reflect-metadata';
import { AnyBlueprint } from '../../../../blueprints/types';
import type { RuntimeValue } from '../../types';
type Constructor<T = object> = new (...args: RuntimeValue[]) => T;
export declare function Blueprint(blueprintData: Partial<AnyBlueprint>): <T extends Constructor>(target: T) => T;
export declare function BlueprintProperty(propertyPath: string): (target: object, propertyKey: string) => void;
export declare function FromBlueprint(blueprintId: string): (target: object, propertyKey: string) => void;
export {};

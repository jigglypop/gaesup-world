import 'reflect-metadata';
import { Token } from '../types';
export declare function Inject(token: Token<object>): (target: object, propertyKey: string | symbol | undefined, parameterIndex?: number) => void;

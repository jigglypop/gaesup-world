import 'reflect-metadata';
import { ServiceTarget, Token } from '../types';
export type ServiceOptions = {
    token?: Token<object>;
    singleton?: boolean;
};
export declare function Service(options?: ServiceOptions): (target: ServiceTarget) => void;

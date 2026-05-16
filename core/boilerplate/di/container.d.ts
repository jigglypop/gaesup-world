import 'reflect-metadata';
import { Factory, ServiceTarget, Token } from '../types';
export declare class DIContainer {
    private static instance;
    private factories;
    private singletons;
    private singletonTokens;
    private resolving;
    private constructor();
    static getInstance(): DIContainer;
    register<T>(token: Token<T>, factory: Factory<T>, singleton?: boolean): void;
    registerService<T extends object>(ServiceConstructor: ServiceTarget<T>): void;
    resolve<T>(token: Token<T>): T;
    private createInstance;
    injectProperties(instance: object): void;
    private autowireProperties;
    clear(): void;
}

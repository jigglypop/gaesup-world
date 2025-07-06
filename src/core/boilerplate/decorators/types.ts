export type Constructor<T = unknown> = new (...args: unknown[]) => T;
export type DecoratorMetadata = {
    name: string;
    method: string;
};
export type PropertyDecorator = (target: object, propertyKey: string) => void;
export type ClassDecorator<T = unknown> = <U extends Constructor<T>>(target: U) => U | void;
export type MethodDecorator = (target: object, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor | void; 
import { IComponent, ComponentContext } from './types';
export declare abstract class BaseComponent implements IComponent {
    type: string;
    enabled: boolean;
    protected context: ComponentContext | null;
    constructor(type: string);
    initialize(context: ComponentContext): void;
    update(context: ComponentContext): void;
    dispose(): void;
    protected abstract onInitialize(): void;
    protected abstract onUpdate(context: ComponentContext): void;
    protected abstract onDispose(): void;
}

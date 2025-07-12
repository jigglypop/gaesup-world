import { IComponent, ComponentContext } from './types';

export abstract class BaseComponent implements IComponent {
  type: string;
  enabled: boolean = true;
  protected context: ComponentContext | null = null;

  constructor(type: string) {
    this.type = type;
  }

  initialize(context: ComponentContext): void {
    this.context = context;
    this.onInitialize();
  }

  update(context: ComponentContext): void {
    if (!this.enabled) return;
    this.context = context;
    this.onUpdate(context);
  }

  dispose(): void {
    this.onDispose();
    this.context = null;
  }

  protected abstract onInitialize(): void;
  protected abstract onUpdate(context: ComponentContext): void;
  protected abstract onDispose(): void;
} 
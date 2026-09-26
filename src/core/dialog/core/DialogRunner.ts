import type {
  DialogChoice,
  DialogCondition,
  DialogContext,
  DialogEffect,
  DialogNode,
  DialogTree,
} from '../types';

export type CustomDialogEffect = Extract<DialogEffect, { type: 'custom' }>;
export type CustomDialogCondition = Extract<DialogCondition, { type: 'custom' }>;

export type DialogRunnerOptions = {
  tree: DialogTree;
  context?: DialogContext;
  onCustomEffect?: (effect: CustomDialogEffect, context: DialogContext) => void;
  /** Decides `custom` conditions; without it they hide their choice. */
  evaluateCondition?: (condition: CustomDialogCondition, context: DialogContext) => boolean;
  onFlag?: (key: string, value: string | number | boolean) => void;
};

export class DialogRunner {
  readonly tree: DialogTree;
  readonly context: DialogContext;
  private currentId: string | null;
  private transitioning = false;
  private readonly options: DialogRunnerOptions;

  constructor(options: DialogRunnerOptions) {
    this.tree = options.tree;
    this.context = options.context ?? {};
    this.currentId = options.tree.startId;
    this.options = options;
  }

  get current(): DialogNode | null {
    if (!this.currentId) return null;
    return this.tree.nodes[this.currentId] ?? null;
  }

  isFinished(): boolean { return this.currentId == null; }

  visibleChoices(): DialogChoice[] {
    const node = this.current;
    if (!node?.choices) return [];
    return node.choices.filter((c) => !c.condition || this.checkCondition(c.condition));
  }

  advance(): DialogNode | null {
    const node = this.current;
    if (!node || this.transitioning || this.visibleChoices().length > 0) return node;
    return this.move(node.effects, node.next);
  }

  choose(index: number): DialogNode | null {
    const node = this.current;
    if (!node?.choices || this.transitioning) return node;
    const choice = this.visibleChoices()[index];
    if (!choice) return node;
    return this.move(choice.effects, choice.next);
  }

  private move(effects: DialogEffect[] | undefined, next: string | null | undefined): DialogNode | null {
    this.transitioning = true;
    try {
      if (effects) for (const effect of effects) this.applyEffect(effect);
      this.currentId = next ?? null;
      return this.current;
    } finally {
      this.transitioning = false;
    }
  }

  private checkCondition(condition: DialogCondition): boolean {
    if (condition.type === 'flagEquals') return this.context.flags?.[condition.key] === condition.value;
    return this.options.evaluateCondition?.(condition, this.context) ?? false;
  }

  private applyEffect(effect: DialogEffect): void {
    if (effect.type === 'setFlag') {
      (this.context.flags ??= {})[effect.key] = effect.value;
      this.options.onFlag?.(effect.key, effect.value);
      return;
    }
    this.options.onCustomEffect?.(effect, this.context);
  }
}

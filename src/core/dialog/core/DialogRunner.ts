import type {
  DialogChoice,
  DialogCondition,
  DialogContext,
  DialogEffect,
  DialogNode,
  DialogRuntimeAdapter,
  DialogTree,
} from '../types';

export type DialogRunnerOptions = {
  tree: DialogTree;
  context?: DialogContext;
  adapter?: DialogRuntimeAdapter;
  onCustomEffect?: (effect: Extract<DialogEffect, { type: 'custom' }>) => void;
  onOpenShop?: (shopId?: string) => void;
};

const EMPTY_DIALOG_ADAPTER: DialogRuntimeAdapter = {
  countItem: () => 0,
  addItem: () => 0,
  removeItem: () => undefined,
  getItemName: () => undefined,
  getBells: () => 0,
  addBells: () => undefined,
  spendBells: () => undefined,
  getFriendshipScore: () => 0,
  addFriendship: () => undefined,
  getDay: () => 0,
  notifyFlag: () => undefined,
  startQuest: () => undefined,
  completeQuest: () => undefined,
  notify: () => undefined,
};

export class DialogRunner {
  readonly tree: DialogTree;
  readonly context: DialogContext;
  private currentId: string | null;
  private adapter: DialogRuntimeAdapter;
  private onCustomEffect?: DialogRunnerOptions['onCustomEffect'];
  private onOpenShop?: DialogRunnerOptions['onOpenShop'];

  constructor(opts: DialogRunnerOptions) {
    this.tree = opts.tree;
    this.context = opts.context ?? {};
    this.currentId = opts.tree.startId;
    this.adapter = opts.adapter ?? EMPTY_DIALOG_ADAPTER;
    this.onCustomEffect = opts.onCustomEffect;
    this.onOpenShop = opts.onOpenShop;
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
    if (!node) return null;
    if (node.effects) for (const e of node.effects) this.applyEffect(e);

    if (node.choices && node.choices.length > 0) return node;

    this.currentId = node.next ?? null;
    return this.current;
  }

  choose(index: number): DialogNode | null {
    const node = this.current;
    if (!node?.choices) return node;
    const visible = this.visibleChoices();
    const choice = visible[index];
    if (!choice) return node;
    if (choice.effects) for (const e of choice.effects) this.applyEffect(e);
    this.currentId = choice.next ?? null;
    return this.current;
  }

  private checkCondition(cond: DialogCondition): boolean {
    switch (cond.type) {
      case 'hasItem':
        return this.adapter.countItem(cond.itemId) >= (cond.count ?? 1);
      case 'hasBells':
        return this.adapter.getBells() >= cond.amount;
      case 'flagEquals':
        return this.context.flags?.[cond.key] === cond.value;
      case 'friendshipAtLeast':
        return this.adapter.getFriendshipScore(cond.npcId) >= cond.amount;
      default:
        cond satisfies never;
        return false;
    }
  }

  private applyEffect(effect: DialogEffect): void {
    switch (effect.type) {
      case 'giveItem': {
        const count = effect.count ?? 1;
        const remaining = this.adapter.addItem(effect.itemId, count);
        if (remaining > 0) this.adapter.notify('warn', '인벤토리가 가득 찼습니다');
        else this.adapter.notify('reward', `${this.adapter.getItemName(effect.itemId) ?? effect.itemId} +${count}`);
        return;
      }
      case 'takeItem': {
        this.adapter.removeItem(effect.itemId, effect.count ?? 1);
        return;
      }
      case 'giveBells':
        this.adapter.addBells(effect.amount);
        this.adapter.notify('reward', `+${effect.amount} B`);
        return;
      case 'takeBells':
        this.adapter.spendBells(effect.amount);
        return;
      case 'setFlag':
        if (!this.context.flags) this.context.flags = {};
        this.context.flags[effect.key] = effect.value;
        this.adapter.notifyFlag(effect.key, effect.value);
        return;
      case 'addFriendship': {
        this.adapter.addFriendship(effect.npcId, effect.amount, this.adapter.getDay());
        return;
      }
      case 'startQuest':
        this.adapter.startQuest(effect.questId);
        return;
      case 'completeQuest':
        this.adapter.completeQuest(effect.questId);
        return;
      case 'openShop':
        this.onOpenShop?.(effect.shopId);
        return;
      case 'custom':
        this.onCustomEffect?.(effect);
        return;
      default:
        effect satisfies never;
        return;
    }
  }
}

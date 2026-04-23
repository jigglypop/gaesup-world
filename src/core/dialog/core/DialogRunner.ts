import { useWalletStore } from '../../economy/stores/walletStore';
import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../items/registry/ItemRegistry';
import { useQuestStore } from '../../quests/stores/questStore';
import { useFriendshipStore } from '../../relations/stores/friendshipStore';
import { useTimeStore } from '../../time/stores/timeStore';
import { notify } from '../../ui/components/Toast/toastStore';
import type {
  DialogChoice,
  DialogCondition,
  DialogContext,
  DialogEffect,
  DialogNode,
  DialogTree,
} from '../types';

export type DialogRunnerOptions = {
  tree: DialogTree;
  context?: DialogContext;
  onCustomEffect?: (effect: Extract<DialogEffect, { type: 'custom' }>) => void;
  onOpenShop?: (shopId?: string) => void;
};

export class DialogRunner {
  readonly tree: DialogTree;
  readonly context: DialogContext;
  private currentId: string | null;
  private onCustomEffect?: DialogRunnerOptions['onCustomEffect'];
  private onOpenShop?: DialogRunnerOptions['onOpenShop'];

  constructor(opts: DialogRunnerOptions) {
    this.tree = opts.tree;
    this.context = opts.context ?? {};
    this.currentId = opts.tree.startId;
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
        return useInventoryStore.getState().countOf(cond.itemId) >= (cond.count ?? 1);
      case 'hasBells':
        return useWalletStore.getState().bells >= cond.amount;
      case 'flagEquals':
        return this.context.flags?.[cond.key] === cond.value;
      case 'friendshipAtLeast':
        return useFriendshipStore.getState().scoreOf(cond.npcId) >= cond.amount;
      default:
        return true;
    }
  }

  private applyEffect(effect: DialogEffect): void {
    switch (effect.type) {
      case 'giveItem': {
        const def = getItemRegistry().get(effect.itemId);
        const remaining = useInventoryStore.getState().add(effect.itemId, effect.count ?? 1);
        if (remaining > 0) notify('warn', '인벤토리가 가득 찼습니다');
        else notify('reward', `${def?.name ?? effect.itemId} +${effect.count ?? 1}`);
        return;
      }
      case 'takeItem': {
        useInventoryStore.getState().removeById(effect.itemId, effect.count ?? 1);
        return;
      }
      case 'giveBells':
        useWalletStore.getState().add(effect.amount);
        notify('reward', `+${effect.amount} B`);
        return;
      case 'takeBells':
        useWalletStore.getState().spend(effect.amount);
        return;
      case 'setFlag':
        if (!this.context.flags) this.context.flags = {};
        this.context.flags[effect.key] = effect.value;
        useQuestStore.getState().notifyFlag(effect.key, effect.value);
        return;
      case 'addFriendship': {
        const day = Math.floor(useTimeStore.getState().totalMinutes / (60 * 24));
        useFriendshipStore.getState().add(effect.npcId, effect.amount, day);
        return;
      }
      case 'startQuest':
        useQuestStore.getState().start(effect.questId);
        return;
      case 'completeQuest':
        useQuestStore.getState().complete(effect.questId);
        return;
      case 'openShop':
        this.onOpenShop?.(effect.shopId);
        return;
      case 'custom':
        this.onCustomEffect?.(effect);
        return;
      default:
        return;
    }
  }
}

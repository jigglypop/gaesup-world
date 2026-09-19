import { useWalletStore, type WalletStore } from '../../economy/stores/walletStore';
import { useInventoryStore, type InventoryStore } from '../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../items/registry/ItemRegistry';
import { useQuestStore, type QuestStore } from '../../quests/stores/questStore';
import { useFriendshipStore, type FriendshipStore } from '../../relations/stores/friendshipStore';
import { useTimeStore, type TimeStore } from '../../time/stores/timeStore';
import { notify } from '../../ui/components/Toast/toastStore';
import type { DialogRuntimeAdapter } from '../types';

const MINUTES_PER_DAY = 60 * 24;

export type DialogStoreDependencies = { inventory: InventoryStore; wallet: WalletStore; friendship: FriendshipStore; time: TimeStore; quests: QuestStore };

export function createDialogRuntimeAdapter(dependencies: DialogStoreDependencies): DialogRuntimeAdapter {
return {
  countItem: (itemId) => dependencies.inventory.getState().countOf(itemId),
  addItem: (itemId, count) => dependencies.inventory.getState().add(itemId, count),
  removeItem: (itemId, count) => dependencies.inventory.getState().removeById(itemId, count),
  getItemName: (itemId) => getItemRegistry().get(itemId)?.name,
  getBells: () => dependencies.wallet.getState().bells,
  addBells: (amount) => dependencies.wallet.getState().add(amount),
  spendBells: (amount) => dependencies.wallet.getState().spend(amount),
  getFriendshipScore: (npcId) => dependencies.friendship.getState().scoreOf(npcId),
  addFriendship: (npcId, amount, day) => dependencies.friendship.getState().add(npcId, amount, day),
  getDay: () => Math.floor(dependencies.time.getState().totalMinutes / MINUTES_PER_DAY),
  notifyFlag: (key, value) => dependencies.quests.getState().notifyFlag(key, value),
  startQuest: (questId) => dependencies.quests.getState().start(questId),
  completeQuest: (questId) => dependencies.quests.getState().complete(questId),
  notify,
};

}

export const dialogRuntimeAdapter = createDialogRuntimeAdapter({ inventory: useInventoryStore, wallet: useWalletStore, friendship: useFriendshipStore, time: useTimeStore, quests: useQuestStore });

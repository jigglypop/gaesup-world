import { useWalletStore } from '../../economy/stores/walletStore';
import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../items/registry/ItemRegistry';
import { useQuestStore } from '../../quests/stores/questStore';
import { useFriendshipStore } from '../../relations/stores/friendshipStore';
import { useTimeStore } from '../../time/stores/timeStore';
import { notify } from '../../ui/components/Toast/toastStore';
import type { DialogRuntimeAdapter } from '../types';

const MINUTES_PER_DAY = 60 * 24;

export const dialogRuntimeAdapter: DialogRuntimeAdapter = {
  countItem: (itemId) => useInventoryStore.getState().countOf(itemId),
  addItem: (itemId, count) => useInventoryStore.getState().add(itemId, count),
  removeItem: (itemId, count) => useInventoryStore.getState().removeById(itemId, count),
  getItemName: (itemId) => getItemRegistry().get(itemId)?.name,
  getBells: () => useWalletStore.getState().bells,
  addBells: (amount) => useWalletStore.getState().add(amount),
  spendBells: (amount) => useWalletStore.getState().spend(amount),
  getFriendshipScore: (npcId) => useFriendshipStore.getState().scoreOf(npcId),
  addFriendship: (npcId, amount, day) => useFriendshipStore.getState().add(npcId, amount, day),
  getDay: () => Math.floor(useTimeStore.getState().totalMinutes / MINUTES_PER_DAY),
  notifyFlag: (key, value) => useQuestStore.getState().notifyFlag(key, value),
  startQuest: (questId) => useQuestStore.getState().start(questId),
  completeQuest: (questId) => useQuestStore.getState().complete(questId),
  notify,
};

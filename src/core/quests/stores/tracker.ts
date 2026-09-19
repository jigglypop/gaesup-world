import type { QuestStore } from './questStore';
import type { InventoryStore } from '../../inventory/stores/inventoryStore';
import { createSharedObserver } from '../../stores/sharedObserver';

export const acquireQuestObjectiveTracker = createSharedObserver<InventoryStore, QuestStore>((inventory, quests, { active }) => inventory.subscribe((state, previous) => {
  if (!active() || state.slots === previous.slots || state.hydrationRevision !== previous.hydrationRevision) return;
  for (const progress of quests.getState().active()) {
    if (!active()) break;
    quests.getState().recheck(progress.questId);
  }
}));

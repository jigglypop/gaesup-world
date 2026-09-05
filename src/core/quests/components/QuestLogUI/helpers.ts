import { useInventoryStore } from '../../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import { getObjectiveCount } from '../../core/objectiveProgress';
import { getQuestRegistry } from '../../registry/QuestRegistry';
import type { QuestObjective, QuestProgress, QuestReward } from '../../types';

const SINGLE_STEP = 1;

export function describeObjective(objective: QuestObjective, itemName?: string): string {
  switch (objective.type) {
    case 'collect':
      return `${itemName ?? objective.itemId} 모으기`;
    case 'deliver':
      return `${objective.npcId}에게 ${itemName ?? objective.itemId} 전달`;
    case 'talk':
      return `${objective.npcId}와 대화`;
    case 'visit':
      return `${objective.tag} 방문`;
    case 'flag':
      return '조건 달성';
    default:
      return '';
  }
}

export function describeReward(reward: QuestReward): string {
  switch (reward.type) {
    case 'item':
      return `${getItemRegistry().get(reward.itemId)?.name ?? reward.itemId} x${reward.count ?? SINGLE_STEP}`;
    case 'bells':
      return `${reward.amount} 벨`;
    case 'friendship':
      return `친밀도 +${reward.amount}`;
    default:
      return '';
  }
}

export function describeObjectiveProgress(
  objective: QuestObjective,
  progress: QuestProgress,
): { label: string; count: number; needed: number } {
  const hasCount = objective.type === 'collect' || objective.type === 'deliver';
  const needed = hasCount ? objective.count : SINGLE_STEP;
  const count = getObjectiveCount(getQuestRegistry().get(progress.questId), progress, objective,
    objective.type === 'collect' ? useInventoryStore.getState().countOf(objective.itemId) : 0);
  const itemName = hasCount
    ? (getItemRegistry().get(objective.itemId)?.name ?? objective.itemId)
    : undefined;
  return {
    label: objective.description ?? describeObjective(objective, itemName),
    count,
    needed,
  };
}

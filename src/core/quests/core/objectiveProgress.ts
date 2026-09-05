import type { QuestDef, QuestObjective, QuestProgress } from '../types';

export function getObjectiveCount(
  def: QuestDef | undefined,
  progress: QuestProgress,
  objective: QuestObjective,
  heldCount = 0,
): number {
  if (objective.type !== 'collect') return progress.progress[objective.id] ?? 0;
  let count = heldCount;
  for (const other of def?.objectives ?? []) {
    if (other.type === 'deliver' && other.itemId === objective.itemId) {
      count += Math.min(other.count, Math.max(0, progress.progress[other.id] ?? 0));
    }
  }
  return Math.min(objective.count, count);
}

import { DefinitionRegistry } from '../../utils/definitionRegistry';
import type { QuestDef, QuestId } from '../types';

export type QuestRegistry = DefinitionRegistry<QuestId, QuestDef>;

let _instance: QuestRegistry | null = null;
export function getQuestRegistry(): QuestRegistry {
  if (!_instance) _instance = new DefinitionRegistry('QuestId');
  return _instance;
}

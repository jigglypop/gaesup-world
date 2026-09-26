import { DefinitionRegistry } from '../../utils/definitionRegistry';
import type { DialogTree, DialogTreeId } from '../types';

export type DialogRegistry = DefinitionRegistry<DialogTreeId, DialogTree>;

let _instance: DialogRegistry | null = null;
export function getDialogRegistry(): DialogRegistry {
  if (!_instance) _instance = new DefinitionRegistry('DialogTreeId');
  return _instance;
}

import { DefinitionRegistry } from '../../utils/definitionRegistry';
import type { DialogTree, DialogTreeId } from '../types';

export type DialogRegistry = DefinitionRegistry<DialogTreeId, DialogTree>;

export const createDialogRegistry = (): DialogRegistry => new DefinitionRegistry('DialogTreeId');

let _instance: DialogRegistry | null = null;
/** The page registry used where no runtime owns the dialog store; a runtime has its own `dialogRegistry`. */
export function getDialogRegistry(): DialogRegistry {
  if (!_instance) _instance = createDialogRegistry();
  return _instance;
}

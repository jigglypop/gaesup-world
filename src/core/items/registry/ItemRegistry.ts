import { DefinitionRegistry } from '../../utils/definitionRegistry';
import { isAmount, isId, isRecord } from '../../utils/guards';
import type { ItemDef, ItemId } from '../types';

const isOptionalAmount = (value: unknown) => value === undefined || isAmount(value);

/** The fields that inventory stacking and shop prices compute with. */
function isItemDef(value: unknown): value is ItemDef {
  return isRecord<ItemDef>(value) && isId(value.id)
    && typeof value.name === 'string' && typeof value.icon === 'string'
    && typeof value.stackable === 'boolean'
    && Number.isSafeInteger(value.maxStack) && (value.maxStack as number) >= 1
    && isOptionalAmount(value.buyPrice) && isOptionalAmount(value.sellPrice) && isOptionalAmount(value.durability);
}

export type ItemRegistry = DefinitionRegistry<ItemId, ItemDef>;

let _instance: ItemRegistry | null = null;

export function getItemRegistry(): ItemRegistry {
  if (!_instance) _instance = new DefinitionRegistry('ItemId', isItemDef);
  return _instance;
}

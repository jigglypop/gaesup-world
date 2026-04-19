export type ItemId = string;

export type ItemCategory =
  | 'tool'
  | 'material'
  | 'food'
  | 'fish'
  | 'bug'
  | 'furniture'
  | 'misc';

export type ToolKind = 'axe' | 'shovel' | 'net' | 'rod' | 'water' | 'seed';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type ItemDef = {
  id: ItemId;
  name: string;
  icon: string;
  category: ItemCategory;
  stackable: boolean;
  maxStack: number;
  buyPrice?: number;
  sellPrice?: number;
  description?: string;
  toolKind?: ToolKind;
  durability?: number;
  rarity?: Rarity;
  color?: string;
};

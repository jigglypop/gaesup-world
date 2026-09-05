import {
  getQuestRegistry,
  getRecipeRegistry,
  getItemRegistry,
  getCropRegistry,
  SEED_CROPS,
  type ItemDef,
  type QuestDef,
  type RecipeDef,
} from 'gaesup-world';

import { registerSeedDialogs } from './dialog/seedDialogs';

const STACKABLE_ITEM = { icon: '', stackable: true, maxStack: 99 };
const TOOL_ITEM = { icon: '', stackable: false, maxStack: 1, category: 'tool' as const };

export const WORLD_ITEMS: ItemDef[] = [
  { ...TOOL_ITEM, id: 'axe', name: '도끼', toolKind: 'axe', color: '#b3bcc7' },
  { ...TOOL_ITEM, id: 'shovel', name: '삽', toolKind: 'shovel', color: '#ad8968' },
  { ...TOOL_ITEM, id: 'water-can', name: '물뿌리개', toolKind: 'water', color: '#69bce8' },
  { ...TOOL_ITEM, id: 'rod', name: '낚싯대', toolKind: 'rod', color: '#b78b5e' },
  { ...TOOL_ITEM, id: 'net', name: '잠자리채', toolKind: 'net', color: '#c5e8ce' },
  { ...STACKABLE_ITEM, id: 'seed-turnip', name: '순무 씨앗', category: 'misc', toolKind: 'seed', color: '#ad965f' },
  { ...STACKABLE_ITEM, id: 'turnip', name: '순무', category: 'food', color: '#dfc7ed' },
  { ...STACKABLE_ITEM, id: 'seed-tomato', name: '토마토 씨앗', category: 'misc', toolKind: 'seed', color: '#b89864' },
  { ...STACKABLE_ITEM, id: 'tomato', name: '토마토', category: 'food', color: '#e54b4b' },
  { ...STACKABLE_ITEM, id: 'apple', name: '사과', category: 'food', color: '#ed7373' },
  { ...STACKABLE_ITEM, id: 'wood', name: '목재', category: 'material', color: '#b58a60' },
  { ...STACKABLE_ITEM, id: 'stone', name: '돌', category: 'material', color: '#a1a9b0' },
  { ...STACKABLE_ITEM, id: 'shell', name: '조개껍데기', category: 'material', color: '#f5d3b7' },
  { ...STACKABLE_ITEM, id: 'flower-pink', name: '분홍 꽃', category: 'misc', color: '#f5a0cb' },
  { ...STACKABLE_ITEM, id: 'fish-bass', name: '배스', category: 'fish', color: '#96ba83' },
  { icon: '', id: 'chair-basic', name: '소박한 의자', category: 'furniture', stackable: false, maxStack: 1, color: '#b58a60' },
];

export const SEED_QUESTS: QuestDef[] = [
  {
    id: 'q.intro.gather-wood',
    name: '첫 모험: 나무를 베다',
    giverNpcId: 'mei',
    summary: '메이의 부탁으로 목재 5개를 모은다.',
    objectives: [
      { id: 'o1', type: 'collect', itemId: 'wood', count: 5, description: '목재 5개 수집' },
      { id: 'o2', type: 'deliver', npcId: 'mei', itemId: 'wood', count: 5, description: '메이에게 전달' },
    ],
    rewards: [
      { type: 'bells', amount: 300 },
      { type: 'friendship', npcId: 'mei', amount: 10 },
    ],
  },
  {
    id: 'q.fish.first',
    name: '첫 낚시',
    giverNpcId: 'tommy',
    summary: '바다에서 물고기를 한 마리 잡아 토미에게 보여준다.',
    objectives: [
      { id: 'o1', type: 'collect', itemId: 'fish-bass', count: 1, description: '배스 1마리 잡기' },
    ],
    rewards: [
      { type: 'bells', amount: 200 },
      { type: 'item', itemId: 'rod', count: 1 },
    ],
  },
];

export const SEED_RECIPES: RecipeDef[] = [
  {
    id: 'r.workbench.basic',
    name: '소박한 의자',
    ingredients: [{ itemId: 'wood', count: 4 }],
    output: { itemId: 'chair-basic', count: 1 },
    unlockedByDefault: true,
  },
  {
    id: 'r.fishbait',
    name: '간이 낚싯대',
    ingredients: [
      { itemId: 'wood', count: 3 },
      { itemId: 'shell', count: 1 },
    ],
    output: { itemId: 'rod', count: 1 },
    requireBells: 100,
    unlockedByDefault: true,
  },
];

export function registerSeedContent(): void {
  registerSeedDialogs();
  getItemRegistry().registerAll(WORLD_ITEMS);
  getCropRegistry().registerAll(SEED_CROPS);
  getQuestRegistry().registerAll(SEED_QUESTS);
  getRecipeRegistry().registerAll(SEED_RECIPES);
}

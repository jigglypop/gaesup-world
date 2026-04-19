import {
  getQuestRegistry,
  getRecipeRegistry,
  type QuestDef,
  type RecipeDef,
} from '../../src';

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
    output: { itemId: 'flower-pink', count: 1 },
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

let _registered = false;
export function registerSeedContent(): void {
  if (_registered) return;
  _registered = true;
  getQuestRegistry().registerAll(SEED_QUESTS);
  getRecipeRegistry().registerAll(SEED_RECIPES);
}

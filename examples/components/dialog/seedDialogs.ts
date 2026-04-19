import type { DialogTree } from '../../../src';
import { getDialogRegistry } from '../../../src';

const SHOPKEEPER_TREE: DialogTree = {
  id: 'npc.shopkeeper',
  startId: 'greet',
  nodes: {
    greet: {
      id: 'greet',
      speaker: '상점주인 토미',
      text: '어서오세요! 오늘은 어떤 일로 오셨나요?',
      choices: [
        { text: '상점 둘러보기', next: 'goodbye', effects: [{ type: 'openShop' }] },
        {
          text: '시식용 사과 받기',
          next: 'gave-apple',
          effects: [{ type: 'giveItem', itemId: 'apple', count: 1 }],
        },
        { text: '아니 그냥 인사하러', next: 'wave' },
      ],
    },
    'gave-apple': {
      id: 'gave-apple',
      speaker: '상점주인 토미',
      text: '맛있게 드세요. 또 오시면 더 좋은 거 보여드릴게요.',
      next: null,
    },
    wave: {
      id: 'wave',
      speaker: '상점주인 토미',
      text: '하하, 천천히 둘러보고 가세요.',
      next: null,
    },
    goodbye: {
      id: 'goodbye',
      speaker: '상점주인 토미',
      text: '구경 잘 하셨나요? 좋은 하루!',
      next: null,
    },
  },
};

const VILLAGER_TREE: DialogTree = {
  id: 'npc.villager',
  startId: 'hello',
  nodes: {
    hello: {
      id: 'hello',
      speaker: '메이',
      text: '오늘 날씨 좋네요. 혹시 부탁 하나 들어주실래요?',
      choices: [
        {
          text: '무슨 부탁이에요?',
          next: 'quest-offer',
        },
        { text: '낚시는 어때요?', next: 'tip-fish' },
        { text: '나중에요', next: 'wave' },
      ],
    },
    'quest-offer': {
      id: 'quest-offer',
      speaker: '메이',
      text: '집을 새로 지으려는데 목재가 부족해요. 5개만 가져다주실 수 있을까요?',
      choices: [
        {
          text: '도와드릴게요',
          next: 'quest-accepted',
          effects: [{ type: 'startQuest', questId: 'q.intro.gather-wood' }],
        },
        { text: '나중에요', next: 'wave' },
      ],
    },
    'quest-accepted': {
      id: 'quest-accepted',
      speaker: '메이',
      text: '고마워요! 도끼를 들고 [F] 키로 나무를 베면 됩니다. 모이면 다시 와주세요.',
      next: null,
    },
    'tip-fish': {
      id: 'tip-fish',
      speaker: '메이',
      text: '바다는 동쪽 모래사장이에요. 낚싯대를 들고 [F] 키로 던지면 됩니다.',
      next: null,
    },
    wave: {
      id: 'wave',
      speaker: '메이',
      text: '천천히 둘러보고 가세요.',
      next: null,
    },
  },
};

const CRAFTSMAN_TREE: DialogTree = {
  id: 'npc.craftsman',
  startId: 'greet',
  nodes: {
    greet: {
      id: 'greet',
      speaker: '제작가 류',
      text: '제작이 필요하면 언제든 오세요. 작업대를 보시겠어요?',
      choices: [
        { text: '작업대 열기', next: 'opened', effects: [{ type: 'custom', key: 'openCrafting' }] },
        { text: '도감을 보고 싶어요', next: 'catalog-tip' },
        { text: '됐어요', next: 'wave' },
      ],
    },
    opened: { id: 'opened', speaker: '제작가 류', text: '천천히 골라보세요.', next: null },
    'catalog-tip': {
      id: 'catalog-tip',
      speaker: '제작가 류',
      text: '[K] 키로 도감을 열 수 있어요. 모은 것이 모두 기록됩니다.',
      next: null,
    },
    wave: { id: 'wave', speaker: '제작가 류', text: '필요하면 또 오세요.', next: null },
  },
};

let _registered = false;
export function registerSeedDialogs(): void {
  if (_registered) return;
  _registered = true;
  getDialogRegistry().registerAll([SHOPKEEPER_TREE, VILLAGER_TREE, CRAFTSMAN_TREE]);
}

export const SEED_DIALOG_TREES = [SHOPKEEPER_TREE, VILLAGER_TREE, CRAFTSMAN_TREE];

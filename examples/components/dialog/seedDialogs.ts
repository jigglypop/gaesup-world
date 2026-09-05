import type { DialogTree } from 'gaesup-world';
import { getDialogRegistry } from 'gaesup-world';

const SHOPKEEPER_TREE: DialogTree = {
  id: 'npc.shopkeeper',
  startId: 'greet',
  nodes: {
    greet: {
      id: 'greet',
      speaker: '토미',
      text: '안녕하세요! 개숲 마을에 오신 걸 환영해요. 사과 하나 드릴까요?',
      choices: [
        {
          text: '사과 받기',
          next: 'gave-apple',
          effects: [{ type: 'giveItem', itemId: 'apple', count: 1 }],
        },
        { text: '그냥 인사하기', next: 'wave' },
      ],
    },
    'gave-apple': {
      id: 'gave-apple',
      speaker: '토미',
      text: '가방에 빈자리가 있으면 사과를 받을 수 있어요. I 키로 가방을 열어보세요.',
      next: null,
    },
    wave: {
      id: 'wave',
      speaker: '토미',
      text: '천천히 마을을 둘러보세요. 또 놀러 오세요!',
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
      text: '안녕하세요! 목재 5개를 모으는 일을 도와주실래요?',
      choices: [
        {
          text: '부탁 수락하기',
          next: 'quest-accepted',
          effects: [{ type: 'startQuest', questId: 'q.intro.gather-wood' }],
        },
        { text: '팁 듣기', next: 'tip' },
        { text: '목재 전달하기', next: 'delivery', condition: { type: 'hasItem', itemId: 'wood', count: 5 },
          effects: [{ type: 'custom', key: 'deliver-wood' }] },
        { text: '다음에요', next: 'wave' },
      ],
    },
    'quest-accepted': {
      id: 'quest-accepted',
      speaker: '메이',
      text: '좋아요. 나무를 모으는 간단한 퀘스트가 시작됐어요.',
      next: null,
    },
    delivery: {
      id: 'delivery', speaker: '메이',
      text: '진행 중인 부탁에 필요한 목재를 받을게요. J 키로 진행 상황을 확인하고 완료 보상을 받아주세요.',
      next: null,
    },
    tip: {
      id: 'tip',
      speaker: '메이',
      text: '들판에 놓인 목재를 모아보세요. J 키로 부탁의 진행 상황을 확인할 수 있어요.',
      next: null,
    },
    wave: {
      id: 'wave',
      speaker: '메이',
      text: '필요하면 다시 말을 걸어주세요.',
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
      speaker: '류',
      text: '반가워요! 목재가 있다면 소박한 의자를 만들어보세요. V 키로 제작대를 열 수 있어요.',
      choices: [
        { text: '도감 알아보기', next: 'catalog-tip' },
        { text: '다음에요', next: 'wave' },
      ],
    },
    'catalog-tip': {
      id: 'catalog-tip',
      speaker: '류',
      text: 'K 키로 도감을 열면 지금까지 모은 물건을 확인할 수 있어요.',
      next: null,
    },
    wave: {
      id: 'wave',
      speaker: '류',
      text: '새로운 물건을 만들면 마을을 꾸밀 때 써보세요. 또 만나요!',
      next: null,
    },
  },
};

export function registerSeedDialogs(): void {
  getDialogRegistry().registerAll([SHOPKEEPER_TREE, VILLAGER_TREE, CRAFTSMAN_TREE]);
}

export const SEED_DIALOG_TREES = [SHOPKEEPER_TREE, VILLAGER_TREE, CRAFTSMAN_TREE];

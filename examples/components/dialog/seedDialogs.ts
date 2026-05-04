import type { DialogTree } from '../../../src';
import { getDialogRegistry } from '../../../src';

const SHOPKEEPER_TREE: DialogTree = {
  id: 'npc.shopkeeper',
  startId: 'greet',
  nodes: {
    greet: {
      id: 'greet',
      speaker: '토미',
      text: '안녕하세요. 지금 예제 월드는 SDK 기능을 가볍게 보여주는 모드예요.',
      choices: [
        {
          text: '아이템 하나 받아보기',
          next: 'gave-apple',
          effects: [{ type: 'giveItem', itemId: 'apple', count: 1 }],
        },
        { text: '그냥 인사하기', next: 'wave' },
      ],
    },
    'gave-apple': {
      id: 'gave-apple',
      speaker: '토미',
      text: '사과를 하나 넣어둘게요. 인벤토리 예제를 확인해보세요.',
      next: null,
    },
    wave: {
      id: 'wave',
      speaker: '토미',
      text: '천천히 둘러보고 필요한 시스템만 켜서 보세요.',
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
      text: '오늘은 이동, 상호작용, 퀘스트 흐름을 확인하기 좋아요.',
      choices: [
        {
          text: '퀘스트 받아보기',
          next: 'quest-accepted',
          effects: [{ type: 'startQuest', questId: 'q.intro.gather-wood' }],
        },
        { text: '팁 듣기', next: 'tip' },
        { text: '다음에요', next: 'wave' },
      ],
    },
    'quest-accepted': {
      id: 'quest-accepted',
      speaker: '메이',
      text: '좋아요. 나무를 모으는 간단한 퀘스트가 시작됐어요.',
      next: null,
    },
    tip: {
      id: 'tip',
      speaker: '메이',
      text: '기본 예제는 핵심 런타임 흐름만 남겨두고, 경제와 제작 UI는 코어 모듈에서 따로 확인하는 쪽이 깔끔해요.',
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
      text: '저는 제작 UI 대신 대화와 상호작용 예제를 맡고 있어요.',
      choices: [
        { text: '카탈로그 팁 듣기', next: 'catalog-tip' },
        { text: '다음에요', next: 'wave' },
      ],
    },
    'catalog-tip': {
      id: 'catalog-tip',
      speaker: '류',
      text: '[K] 키로 카탈로그를 열 수 있어요. 예제에서 수집 흐름을 확인할 때 유용합니다.',
      next: null,
    },
    wave: {
      id: 'wave',
      speaker: '류',
      text: '필요한 기능만 작게 연결하는 쪽이 SDK 예제로는 더 좋아요.',
      next: null,
    },
  },
};

let _registered = false;
export function registerSeedDialogs(): void {
  if (_registered) return;
  _registered = true;
  getDialogRegistry().registerAll([SHOPKEEPER_TREE, VILLAGER_TREE, CRAFTSMAN_TREE]);
}

export const SEED_DIALOG_TREES = [SHOPKEEPER_TREE, VILLAGER_TREE, CRAFTSMAN_TREE];

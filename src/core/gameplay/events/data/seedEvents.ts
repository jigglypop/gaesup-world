import type { GameplayEventBlueprint } from '../types';

export const SEED_GAMEPLAY_EVENTS: GameplayEventBlueprint[] = [
  {
    id: 'world-ready-visible',
    name: '월드 시작 알림',
    description: '월드가 준비되면 환영 알림을 표시합니다.',
    trigger: { type: 'manual', key: 'world.ready' },
    conditions: [{ type: 'always' }],
    actions: [
      { type: 'toast', kind: 'success', text: '월드에 오신 것을 환영해요!' },
      { type: 'setFlag', key: 'gameplayReady', value: true },
    ],
    policy: { run: 'once' },
    tags: ['starter', 'visible'],
  },
  {
    id: 'welcome-first-talk',
    name: '첫 대화와 환영 퀘스트',
    description: '안내자와 처음 대화하면 환영 퀘스트를 시작합니다.',
    trigger: { type: 'interaction', targetId: 'npc:tommy', action: 'talk' },
    conditions: [{ type: 'questStatus', questId: 'welcome', status: 'available' }],
    actions: [
      { type: 'startQuest', questId: 'welcome' },
      { type: 'showDialog', dialogTreeId: 'npc.shopkeeper', npcId: 'tommy' },
    ],
    policy: { run: 'once' },
    tags: ['starter', 'npc'],
  },
  {
    id: 'meadow-entry-seed-gift',
    name: '초원 첫 방문 선물',
    description: '초원에 처음 들어가면 씨앗을 선물합니다.',
    trigger: { type: 'enterArea', areaId: 'meadow' },
    conditions: [{ type: 'always' }],
    actions: [
      { type: 'giveItem', itemId: 'seed-turnip', count: 3 },
      { type: 'setFlag', key: 'meadowSeedGift', value: true },
    ],
    policy: { run: 'once' },
    tags: ['starter', 'area'],
  },
  {
    id: 'festival-quest-flag',
    name: '축제 시작과 퀘스트 진행',
    description: '달력의 축제가 시작되면 퀘스트 진행 상태를 갱신합니다.',
    trigger: { type: 'calendarEventStarted', eventId: 'spring-flower-fair' },
    actions: [{ type: 'notifyQuestFlag', key: 'festivalStarted', value: true }],
    policy: { run: 'repeat', cooldownMs: 60_000 },
    tags: ['calendar', 'quest'],
  },
];

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
];

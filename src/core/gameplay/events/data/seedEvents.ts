import type { GameplayEventBlueprint } from '../types';

export const SEED_GAMEPLAY_EVENTS: GameplayEventBlueprint[] = [
  {
    id: 'world-ready-visible',
    name: 'World Ready Visible',
    description: 'Shows that gameplay event blueprints are running in the main world.',
    trigger: { type: 'manual', key: 'world.ready' },
    conditions: [{ type: 'always' }],
    actions: [
      { type: 'toast', kind: 'success', text: 'Gameplay Event Blueprint 실행됨' },
      { type: 'setFlag', key: 'gameplayReady', value: true },
    ],
    policy: { run: 'once' },
    tags: ['starter', 'visible'],
  },
  {
    id: 'welcome-first-talk',
    name: 'Welcome First Talk',
    description: 'Starts the welcome quest the first time the player talks to the guide.',
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
    name: 'Meadow Entry Seed Gift',
    description: 'Gives starter seeds when the player first enters the meadow.',
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
    name: 'Festival Quest Flag',
    description: 'Updates quest flag progress when a calendar festival starts.',
    trigger: { type: 'calendarEventStarted', eventId: 'spring-flower-fair' },
    actions: [{ type: 'notifyQuestFlag', key: 'festivalStarted', value: true }],
    policy: { run: 'repeat', cooldownMs: 60_000 },
    tags: ['calendar', 'quest'],
  },
];

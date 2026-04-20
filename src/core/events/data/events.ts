import { getEventRegistry } from '../registry/EventRegistry';
import type { EventDef } from '../types';

export const SEED_EVENTS: EventDef[] = [
  {
    id: 'season.spring',
    name: '봄',
    summary: '꽃이 피고 벌레가 깨어납니다.',
    triggers: [{ kind: 'season', seasons: ['spring'] }],
    tags: ['season:spring', 'fish:bass', 'bug:butterfly'],
  },
  {
    id: 'season.summer',
    name: '여름',
    summary: '낚시와 곤충채집의 계절.',
    triggers: [{ kind: 'season', seasons: ['summer'] }],
    tags: ['season:summer', 'fish:tuna', 'bug:beetle', 'bug:stag'],
  },
  {
    id: 'season.autumn',
    name: '가을',
    summary: '단풍이 들고 낚시 보너스.',
    triggers: [{ kind: 'season', seasons: ['autumn'] }],
    tags: ['season:autumn', 'fish:koi', 'bug:butterfly'],
  },
  {
    id: 'season.winter',
    name: '겨울',
    summary: '눈이 내리고 곤충은 사라집니다.',
    triggers: [{ kind: 'season', seasons: ['winter'] }],
    tags: ['season:winter', 'fish:bass'],
  },
  {
    id: 'event.cherryblossom',
    name: '벚꽃 축제',
    summary: '봄 한정 — 벚꽃 잎이 흩날립니다.',
    triggers: [{ kind: 'monthRange', month: 4, fromDay: 1, toDay: 10 }],
    tags: ['festival', 'visual:sakura'],
  },
  {
    id: 'event.fishing-tourney',
    name: '낚시 대회',
    summary: '주말 한정 낚시 대회 — 보너스 종 출현.',
    triggers: [{ kind: 'weekday', weekdays: ['sat', 'sun'] }],
    tags: ['tourney', 'fish:koi', 'fish:tuna'],
  },
];

let _registered = false;
export function registerSeedEvents(): void {
  if (_registered) return;
  _registered = true;
  getEventRegistry().registerAll(SEED_EVENTS);
}

import {
  createBuildingPlugin,
  createGaesupRuntime,
  type DialogTree,
  type GameplayAreaConfig,
  type GameplayEventBlueprint,
  type GaesupRuntime,
  type NPCInstanceData,
} from 'gaesup-world';

import { at, CELL, createVillage, VILLAGE_VERSION } from './village';

export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

/** Models the player can wear as their 미니미; all are 1.7m adults with idle, walk and run clips. */
export const MINIME_MODELS = [
  { id: 'man', label: '청년', emoji: '🧑' },
  { id: 'teacher', label: '선생님', emoji: '👩‍🏫' },
  { id: 'nurse', label: '간호사', emoji: '👩‍⚕️' },
  { id: 'docter', label: '의사', emoji: '👨‍⚕️' },
  { id: 'police', label: '경찰', emoji: '👮' },
  { id: 'mountain', label: '산악인', emoji: '🧗' },
  { id: 'trainer_green', label: '초록 트레이너', emoji: '🧢' },
  { id: 'trainer_red', label: '빨강 트레이너', emoji: '🎒' },
] as const;
export type MinimeModel = (typeof MINIME_MODELS)[number]['id'];
export const modelUrl = (id: string) => asset(`gltf/${id}.glb`);

type Behavior = NonNullable<NPCInstanceData['behavior']>;

export type Resident = {
  id: string;
  name: string;
  model: string;
  emoji: string;
  /** One-line intro for the 일촌 list. */
  intro: string;
  /** Where they stand, in meters. */
  spot: [number, number];
  /** Said in a speech balloon when the player talks to them. */
  line: string;
  behavior: Behavior;
};

type Point = [number, number];

/** What every resident does: turns smoothly, looks around while standing, waves at whoever talks to them. */
const manner = {
  turnSpeed: 5, glance: 0.5, greetAnimation: 'wave', gestures: { clips: ['wave'], everySeconds: 18 },
  moveAnimation: 'walk', idleAnimation: 'idle',
} satisfies Partial<Behavior>;

const wander = (radius: number, speed = 1.1): Behavior =>
  ({ ...manner, mode: 'wander', speed, wanderRadius: radius, waitSeconds: 2, pauseSeconds: 1.5 });
const stay: Behavior = { ...manner, mode: 'idle', speed: 1 };
/** Walks a loop of `points` for good, resting a moment at the last one. */
const patrol = (points: Point[], speed = 1.4): Behavior =>
  ({ ...manner, mode: 'patrol', speed, loop: true, pauseSeconds: 1, waitSeconds: 0.5, waypoints: points.map(([x, z]) => [x, 0, z]) });
/** Walks `points` there and back again, resting at either end: a zigzag when the points alternate sides. */
const pace = (points: Point[], speed = 1, pause = 2): Behavior =>
  ({ ...manner, mode: 'patrol', speed, loop: false, pauseSeconds: pause, waitSeconds: 0.5, waypoints: points.map(([x, z]) => [x, 0, z]) });

/**
 * The island's residents, each at the model's authored size (adults 1.7m, children 1m), spread over the island on
 * their own routes: the officer walks the main road, his helper circles the plaza, the others pace their corners.
 */
export const RESIDENTS: Resident[] = [
  { id: 'seonsaeng', name: '윤 선생님', model: 'teacher', emoji: '👩‍🏫', intro: '섬 안내를 맡고 있어요', spot: [at(7) + 1.5, at(4) + 1], line: '궁금한 게 있으면 물어보세요!', behavior: stay },
  {
    id: 'doyun', name: '도윤', model: 'docter', emoji: '👨‍⚕️', intro: '섬 보건소 원장님', spot: [at(5), at(4)], line: '어서 와요! 이야기 좀 할까요?',
    behavior: pace([[at(5), at(4)], [at(7), at(5)], [at(8), at(7)], [at(9), at(9)]], 1),
  },
  { id: 'hana', name: '하나', model: 'nurse', emoji: '👩‍⚕️', intro: '꽃밭 산책러', spot: [at(5), at(6)], line: '오늘도 물 많이 마셔요 💧', behavior: wander(4) },
  { id: 'sangin', name: '상인 아저씨', model: 'man', emoji: '🧑‍🍳', intro: '가판대 주인', spot: [at(10), at(4) - 1.8], line: '구경하고 가요~ 오늘은 떨이!', behavior: stay },
  {
    id: 'sani', name: '산이', model: 'mountain', emoji: '🧑‍🌾', intro: '텃밭 가꾸는 산악인', spot: [at(10) - 1, at(7) - 1], line: '올해 토마토 농사는 대풍이에요!',
    behavior: pace([[at(10) - 1, at(7) - 1], [at(11) + 1, at(7)], [at(10) - 1, at(8)], [at(11) + 1, at(8) + 1]], 0.8, 1.5),
  },
  {
    id: 'sungyeong', name: '김 순경', model: 'police', emoji: '👮', intro: '마을 순찰 담당', spot: [at(2), at(5)], line: '섬은 오늘도 평화롭습니다!',
    behavior: patrol([[at(2), at(5)], [at(8), at(5)], [at(8), at(11)], [at(8), at(5)], [at(11), at(5)]]),
  },
  {
    id: 'kkoma', name: '꼬마 순경', model: 'police2', emoji: '🧒', intro: '김 순경의 조수', spot: [at(7), at(9)], line: '나도 커서 경찰이 될 거야!',
    behavior: patrol([[at(7), at(9)], [at(9), at(9) + 1], [at(9), at(11)], [at(7), at(11)]], 1.6),
  },
  { id: 'minjun', name: '민준', model: 'boy', emoji: '👦', intro: '달리기 1등 꼬마', spot: [at(6), at(10)], line: '나 잡아 봐라~!', behavior: wander(7, 2.2) },
  {
    id: 'seoa', name: '서아', model: 'glass', emoji: '👧', intro: '연못 관찰 일지 작성 중', spot: [at(3), at(7)], line: '연못에 물고기가 살까?',
    behavior: pace([[at(3), at(7)], [at(3) + 1.2, at(8)], [at(3), at(9)], [at(3) + 1.2, at(10)]], 0.7),
  },
  {
    id: 'bada', name: '바다', model: 'fish', emoji: '🐟', intro: '해변 지킴이', spot: [at(2), at(12)], line: '파도 소리 들려? 쏴아~',
    behavior: pace([[at(2), at(12)], [at(6), at(12) + 1], [at(10), at(12)], [at(13), at(12) + 1]], 0.9),
  },
];

const DIALOGS: DialogTree[] = [
  {
    id: 'guide',
    startId: 'hello',
    nodes: {
      hello: {
        id: 'hello', speaker: '윤 선생님', text: '미니홈피 섬에 온 걸 환영해요. 무엇이 궁금한가요?',
        choices: [
          { text: '어떻게 움직여요?', next: 'move' },
          { text: '집을 꾸미고 싶어요', next: 'decorate' },
          { text: '이 섬은 뭐로 만들었어요?', next: 'engine' },
        ],
      },
      move: { id: 'move', speaker: '윤 선생님', text: 'WASD나 방향키로 걷고, Shift로 달리고, Space로 뛰어요. 주민 곁에서 E를 누르면 말을 걸 수 있어요.' },
      decorate: { id: 'decorate', speaker: '윤 선생님', text: '위쪽 "꾸미기" 탭을 누르면 미니룸에 가구와 타일을 놓을 수 있어요. 꾸민 모습은 자동으로 저장돼요.' },
      engine: { id: 'engine', speaker: '윤 선생님', text: 'gaesup-world 엔진이에요. 오른쪽 상태 체크 패널에서 지금 FPS와 draw call을 바로 볼 수 있어요.' },
    },
  },
  {
    id: 'clinic',
    startId: 'hello',
    nodes: {
      hello: {
        id: 'hello', speaker: '도윤', text: '오늘 컨디션은 어때요?',
        choices: [
          { text: '최고예요!', next: 'good', effects: [{ type: 'setFlag', key: 'mood', value: 'good' }] },
          { text: '조금 피곤해요', next: 'tired', effects: [{ type: 'setFlag', key: 'mood', value: 'tired' }] },
        ],
      },
      good: { id: 'good', speaker: '도윤', text: '좋네요! 꽃밭 구경하러 가 봐요.' },
      tired: { id: 'tired', speaker: '도윤', text: '미니룸 침대에서 잠깐 쉬어 가요. 해변 모닥불 곁도 따뜻해요.' },
    },
  },
  {
    id: 'stall',
    startId: 'hello',
    nodes: {
      hello: { id: 'hello', speaker: '상인 아저씨', text: '오늘의 추천은 벚꽃 차! 한 잔 할래요?', choices: [{ text: '주세요', next: 'thanks' }, { text: '다음에요', next: 'bye' }] },
      thanks: { id: 'thanks', speaker: '상인 아저씨', text: '향이 좋죠? 또 와요~' },
      bye: { id: 'bye', speaker: '상인 아저씨', text: '언제든 들러요!' },
    },
  },
];

const talk = (npcId: string, dialogTreeId: string): GameplayEventBlueprint => ({
  id: `talk-${npcId}`, name: `${npcId} 대화`, trigger: { type: 'interaction', targetId: npcId }, actions: [{ type: 'showDialog', dialogTreeId, npcId }],
});
const arrive = (areaId: string, text: string): GameplayEventBlueprint => ({
  id: `arrive-${areaId}`, name: `${areaId} 도착`, trigger: { type: 'enterArea', areaId }, actions: [{ type: 'toast', kind: 'info', text }],
});

/** Trigger boxes the rule engine hears through `enterArea`; each spans whole cells of the map. */
const area = (id: string, x: number, z: number, width: number, depth: number): GameplayAreaConfig =>
  ({ id, center: [at(x) + ((width - 1) * CELL) / 2, 1, at(z) + ((depth - 1) * CELL) / 2], size: [width * CELL, 4, depth * CELL] });
export const AREAS: GameplayAreaConfig[] = [
  area('miniroom', 3, 2, 2, 2),
  area('field', 10, 7, 2, 2),
  area('pond', 1, 7, 2, 3),
  area('beach', 0, 12, 14, 2),
];

const RULES: GameplayEventBlueprint[] = [
  talk('seonsaeng', 'guide'),
  talk('doyun', 'clinic'),
  talk('sangin', 'stall'),
  arrive('miniroom', '🏠 나의 미니룸'),
  arrive('field', '🌱 산이네 텃밭'),
  arrive('pond', '🐟 연못가'),
  arrive('beach', '🌊 해변 산책 중'),
];

/** The minihome world: its own runtime, so every store is this world's and saves under `minihome`. */
export function createMinihomeRuntime(): GaesupRuntime {
  const runtime = createGaesupRuntime({ worldId: `minihome-v${VILLAGE_VERSION}`, plugins: [createBuildingPlugin()] });
  runtime.buildingStore.getState().hydrate(createVillage());
  const npc = runtime.npcStore.getState();
  for (const resident of RESIDENTS) {
    npc.addTemplate({
      id: resident.id, name: resident.name, category: 'humanoid', defaultAnimation: 'idle', clothingParts: [], materialPolicy: 'figure',
      baseParts: [{ id: `${resident.id}-body`, type: 'body', url: modelUrl(resident.model), position: [0, 0, 0] }],
    });
    npc.addInstance({
      id: resident.id, templateId: resident.id, name: resident.name,
      position: [resident.spot[0], 0, resident.spot[1]], rotation: [0, 0, 0], scale: [1, 1, 1],
      brain: { mode: 'scripted' },
      behavior: resident.behavior,
      events: [{ id: `${resident.id}-hello`, type: 'onInteract', action: 'dialogue', payload: { type: 'dialogue', text: resident.line, duration: 3 } }],
    });
  }
  for (const tree of DIALOGS) runtime.dialogRegistry.register(tree);
  runtime.gameplayEvents.setBlueprints(RULES);
  return runtime;
}

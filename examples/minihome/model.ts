import { createSceneDocument, createSceneObject, parseSceneDocument } from 'gaesup-world';
import type { SceneObject } from 'gaesup-world';

import { DEFAULT_ROOM_SETTINGS, type RoomSettings } from './roomTypes';
import { brushIndices, createTerrain, farmTerrain, isTerrain, paintTiles, terrainHeight, tileIndex } from './terrain';
import { FURNITURE } from './types';
import type { FurnitureKind, HomeNote, MinihomeData } from './types';

export const STORAGE_KEY = 'gaesup.minihome.v1';
export const MAX_FURNITURE = 160;
const GLOWING = new Set<FurnitureKind>(['lamp', 'neon', 'arcade', 'string-lights', 'lantern']);
const QUARTER = Math.PI / 2;
const BED_TILES = 3;
/** Farm garden: deck and farmhouse at the back, crop beds in four quadrants around cross-shaped dirt paths. */
const FARM_LAYOUT: ReadonlyArray<readonly [FurnitureKind, number, number, number?]> = [
  ['sofa', 0, -10.1], ['table', -2.4, -9.2], ['milk-can', 2.6, -8.9], ['lattice-fence', -3.1, -7.5], ['lattice-fence', 3.1, -7.5],
  ['leafy-tree', -6, -9.6], ['wagon', 7.2, -9.4],
  ['tomato-bed', -3.5, -5.5], ['tomato-bed', -7.5, -5.5], ['corn-bed', 3.5, -5.5], ['corn-bed', 7.5, -5.5],
  ['turnip-bed', -3.5, -1.5], ['turnip-bed', -7.5, -1.5], ['carrot-bed', 3.5, -1.5], ['carrot-bed', 7.5, -1.5],
  ['pumpkin-bed', -3.5, 5.5], ['pumpkin-bed', -7.5, 5.5], ['carrot-bed', 3.5, 5.5], ['carrot-bed', 7.5, 5.5],
  ['pumpkin-bed', -3.5, 9.5], ['pumpkin-bed', -7.5, 9.5], ['wheat-bed', 3.5, 9.5], ['wheat-bed', 7.5, 9.5],
  ...[-9, -7, -5, -3, 3, 5, 7, 9].map(x => ['picket-fence', x, -3.5] as const),
  ...[-7.5, -5.5, 3, 5, 7].map(x => ['picket-fence', x, 0.5] as const), ['garden-sign', -3, 0.5],
  ...[3, 5, 7, 9].map(x => ['picket-fence', x, 11.5] as const),
  ...[-9, -7, -5, -3].map(x => ['log-fence', x, 11.5] as const), ...[5.5, 7.5, 9.5].map(z => ['log-fence', -9.5, z, QUARTER] as const),
  ...[-5.5, 0.5, 3.5, 7.5].map(z => ['string-lights', 0, z] as const),
  ...[-1.5, 5.5, 9.5].flatMap(z => [['lantern', -1.4, z], ['lantern', 1.4, z]] as const),
  ['leafy-tree', -10.6, -5.6], ['water-trough', -10.6, -1.5, QUARTER], ['leafy-tree', -10.8, 7], ['log-pile', -10.8, 10.8],
  ['fruit-tree', 10.7, -5.5], ['fruit-tree', 10.7, 6.5], ['leafy-tree', 10.7, 10.3], ['flower-pot', -1.4, 11.3],
];

export function furnitureKind(object: SceneObject): FurnitureKind | null {
  const kind = object.components.find((component) => component.type === 'miniroom.furniture')?.data[
    'kind'
  ];
  return typeof kind === 'string' && Object.hasOwn(FURNITURE, kind)
    ? (kind as FurnitureKind)
    : null;
}

export function makeFurniture(kind: FurnitureKind, x = 0, z = 1, id: string = crypto.randomUUID(), rotationY = 0) {
  return createSceneObject({
    id,
    name: FURNITURE[kind].name,
    transform: { position: [x, 0, z], rotation: [0, rotationY, 0] },
    components: [{ id: `${id}-appearance`, type: 'miniroom.furniture', data: { kind, bloom: GLOWING.has(kind), emissiveIntensity: 3 } }],
  });
}

export function createMinihome(): MinihomeData {
  const beds = FARM_LAYOUT.filter(([kind]) => kind.endsWith('-bed')).flatMap(([, x, z]) => brushIndices(tileIndex(x, z), BED_TILES));
  const terrain = paintTiles(farmTerrain(), beds, 'soil'); const counts = new Map<FurnitureKind, number>();
  return {
    version: 1,
    profile: {
      name: '개숲',
      title: '오늘도, 나의 작은 세상',
      bio: '천천히 좋아하는 것들로\n채워가는 나의 작은 방.\n잠깐 쉬었다 가세요 ☁',
      mood: '소소한 행복',
    },
    theme: 'peach',
    roomSettings: { ...DEFAULT_ROOM_SETTINGS },
    terrain,
    room: createSceneDocument({
      id: 'my-miniroom',
      name: '개숲 타운',
      objects: FARM_LAYOUT.map(([kind, x, z, rotationY]) => {
        const count = (counts.get(kind) ?? 0) + 1; counts.set(kind, count);
        return makeFurniture(kind, x, z, `${kind}-${count}`, rotationY);
      }).map(object => {
        const [x, , z] = object.transform.position;
        return { ...object, transform: { ...object.transform, position: [x, terrainHeight(terrain, x, z), z] as [number, number, number] } };
      }),
    }),
    diary: [],
    guestbook: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function validNotes(value: unknown): value is HomeNote[] {
  return (
    Array.isArray(value) &&
    value.length <= 100 &&
    value.every(
      (note: unknown) =>
        isRecord(note) &&
        typeof note['id'] === 'string' &&
        note['id'].length > 0 && note['id'].length <= 100 &&
        typeof note['author'] === 'string' &&
        note['author'].length <= 200 &&
        typeof note['text'] === 'string' &&
        note['text'].length <= 1000 &&
        typeof note['date'] === 'string' && Number.isFinite(Date.parse(note['date'])),
    )
  );
}
export function parseMinihome(raw: string): MinihomeData | null {
  try {
    if (raw.length > 512_000) return null;
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data['version'] !== 1 || !isRecord(data['profile'])) return null;
    const profile = data['profile'];
    // Version 1 saves and shared links created before room settings remain readable.
    const settings = data['roomSettings'] === undefined ? DEFAULT_ROOM_SETTINGS : data['roomSettings'];
    if (!isRecord(settings) || !['economy', 'balanced', 'high'].includes(String(settings['quality'])) ||
      !['day', 'evening'].includes(String(settings['lighting'])) ||
      !['garden', 'isometric', 'front', 'top', 'back', 'left', 'right', 'follow'].includes(String(settings['camera'])) ||
      settings['avatar'] !== undefined && !['classic', 'coral', 'blue', 'mint'].includes(String(settings['avatar']))) return null;
    if (settings['sound'] !== undefined && !['calm', 'bright'].includes(String(settings['sound']))) return null;
    const volume = settings['volume'] === undefined ? DEFAULT_ROOM_SETTINGS.volume : settings['volume'];
    if (typeof volume !== 'number' || !Number.isFinite(volume) || volume < 0 || volume > 1) return null;
    const resolved = { ...DEFAULT_ROOM_SETTINGS, ...settings, volume };
    if (!['orthographic', 'perspective'].includes(String(resolved.projection))) return null;
    for (const key of ['pan', 'rotate', 'damping', 'bloom', 'natureMotion', 'festive'] as const) if (typeof resolved[key] !== 'boolean') return null;
    for (const [key, min, max] of [['moveSpeed', 1, 8], ['bloomStrength', 0, 2], ['bloomRadius', 0, 1], ['bloomThreshold', 0, 3]] as const) {
      if (typeof resolved[key] !== 'number' || !Number.isFinite(resolved[key]) || resolved[key] < min || resolved[key] > max) return null;
    }
    const terrain = data['terrain'] === undefined ? createTerrain() : data['terrain'];
    if (!isTerrain(terrain)) return null;
    for (const field of ['name', 'title', 'bio', 'mood']) {
      if (typeof profile[field] !== 'string' || profile[field].length > 200) return null;
    }
    if (
      !['peach', 'sage', 'lavender'].includes(String(data['theme'])) ||
      !validNotes(data['diary']) ||
      !validNotes(data['guestbook'])
    )
      return null;
    const room = parseSceneDocument(data['room']);
    if (
      !room.ok ||
      !room.document ||
      room.document.objects.length > MAX_FURNITURE ||
      room.document.objects.some(
        (object) =>
          !furnitureKind(object) ||
          object.parentId !== undefined ||
          Math.abs(object.transform.position[0]) > terrain.size / 2 - 0.25 ||
          Math.abs(object.transform.position[2]) > terrain.size / 2 - 0.25 ||
          (object.transform.position[1] < 0 || object.transform.position[1] > 4.5) ||
          object.transform.scale.some((scale) => scale !== 1),
      )
    )
      return null;
    for (const object of room.document.objects) {
      const appearance = object.components.find(component => component.type === 'miniroom.furniture')!.data;
      if (appearance['bloom'] !== undefined && typeof appearance['bloom'] !== 'boolean') return null;
      const intensity = appearance['emissiveIntensity'];
      if (intensity !== undefined && (typeof intensity !== 'number' || !Number.isFinite(intensity) || intensity < 0 || intensity > 8)) return null;
    }
    return {
      version: 1,
      profile: { name: profile['name'] as string, title: profile['title'] as string,
        bio: profile['bio'] as string, mood: profile['mood'] as string },
      theme: data['theme'] as MinihomeData['theme'], room: room.document,
      terrain: { size: terrain.size, tiles: [...terrain.tiles], ...(terrain.heights ? { heights: [...terrain.heights] } : {}), ...(terrain.stairs ? { stairs: [...terrain.stairs] } : {}) },
      roomSettings: Object.fromEntries(Object.keys(DEFAULT_ROOM_SETTINGS).map(key => [key, resolved[key as keyof typeof resolved]])) as RoomSettings,
      diary: (data['diary'] as HomeNote[]).map(({ id, author, text, date }) => ({ id, author, text, date })),
      guestbook: (data['guestbook'] as HomeNote[]).map(({ id, author, text, date }) => ({ id, author, text, date })),
    };
  } catch {
    return null;
  }
}

export const BACKUP_KEY = `${STORAGE_KEY}.backup`;

export function loadMinihome(): { data: MinihomeData; warning: string; raw: string | null; autoSave: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: createMinihome(), warning: '', raw, autoSave: true };
    const data = parseMinihome(raw);
    if (data) return { data, warning: '', raw, autoSave: true };
    const backup = localStorage.getItem(BACKUP_KEY);
    const recovered = backup ? parseMinihome(backup) : null;
    return {
      data: recovered ?? createMinihome(), raw, autoSave: false,
      warning:
        recovered ? '이전 백업을 복구했습니다. 확인 후 저장해 주세요.' : '저장된 데이터를 읽지 못했습니다. 원본은 보존했으며, 저장 버튼을 누르면 현재 방으로 교체됩니다.',
    };
  } catch {
    return {
      data: createMinihome(), raw: null, autoSave: false,
      warning: '브라우저 저장소에 접근할 수 없습니다. 지금 꾸미기는 가능하지만 저장이 제한됩니다.',
    };
  }
}

export function saveMinihome(raw: string, expected: string | null): void {
  if (!parseMinihome(raw)) throw new Error('저장할 데이터가 올바르지 않습니다.');
  const current = localStorage.getItem(STORAGE_KEY);
  if (current !== expected) throw new Error('다른 탭에서 저장한 변경이 있습니다. 백업을 내려받고 새로고침해 주세요.');
  if (current && parseMinihome(current)) localStorage.setItem(BACKUP_KEY, current);
  localStorage.setItem(STORAGE_KEY, raw);
}

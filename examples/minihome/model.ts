import { createSceneDocument, createSceneObject, parseSceneDocument } from 'gaesup-world';
import type { SceneObject } from 'gaesup-world';

import { FURNITURE } from './types';
import type { FurnitureKind, HomeNote, MinihomeData } from './types';

export const STORAGE_KEY = 'gaesup.minihome.v1';
export const MAX_FURNITURE = 40;

export function furnitureKind(object: SceneObject): FurnitureKind | null {
  const kind = object.components.find((component) => component.type === 'miniroom.furniture')?.data[
    'kind'
  ];
  return typeof kind === 'string' && Object.hasOwn(FURNITURE, kind)
    ? (kind as FurnitureKind)
    : null;
}

export function makeFurniture(kind: FurnitureKind, x = 0, z = 1, id: string = crypto.randomUUID()) {
  return createSceneObject({
    id,
    name: FURNITURE[kind].name,
    transform: { position: [x, 0, z] },
    components: [{ id: `${id}-appearance`, type: 'miniroom.furniture', data: { kind } }],
  });
}

export function createMinihome(): MinihomeData {
  return {
    version: 1,
    profile: {
      name: '개숲',
      title: '오늘도, 나의 작은 세상',
      bio: '천천히 좋아하는 것들로\n채워가는 나의 작은 방.\n잠깐 쉬었다 가세요 ☁',
      mood: '소소한 행복',
    },
    theme: 'peach',
    room: createSceneDocument({
      id: 'my-miniroom',
      name: '햇살이 머무는 방',
      objects: [
        makeFurniture('sofa', -1.8, -1.7, 'sofa-1'),
        makeFurniture('table', -1.1, 0.1, 'table-1'),
        makeFurniture('plant', 3.1, -2.7, 'plant-1'),
        makeFurniture('shelf', 1.7, -3.1, 'shelf-1'),
        makeFurniture('lamp', -3.1, -2.6, 'lamp-1'),
        makeFurniture('cushion', 1.5, 1.7, 'cushion-1'),
      ],
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
          Math.abs(object.transform.position[0]) > 3.5 ||
          Math.abs(object.transform.position[2]) > 3.5 ||
          object.transform.position[1] !== 0 ||
          object.transform.scale.some((scale) => scale !== 1),
      )
    )
      return null;
    return {
      version: 1,
      profile: { name: profile['name'] as string, title: profile['title'] as string,
        bio: profile['bio'] as string, mood: profile['mood'] as string },
      theme: data['theme'] as MinihomeData['theme'], room: room.document,
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

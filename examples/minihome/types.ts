import type { SceneDocument } from 'gaesup-world';

export type FurnitureKind = 'sofa' | 'table' | 'plant' | 'shelf' | 'lamp' | 'cushion';
export type RoomTheme = 'peach' | 'sage' | 'lavender';
export type HomeTab = 'home' | 'diary' | 'guestbook';
export type HomeNote = { id: string; author: string; text: string; date: string };
export type MinihomeData = {
  version: 1;
  profile: { name: string; title: string; bio: string; mood: string };
  theme: RoomTheme;
  room: SceneDocument;
  diary: HomeNote[];
  guestbook: HomeNote[];
};
export const FURNITURE: Record<FurnitureKind, { name: string; icon: string }> = {
  sofa: { name: '소파', icon: '▰' },
  table: { name: '테이블', icon: '▤' },
  plant: { name: '화분', icon: '✿' },
  shelf: { name: '책장', icon: '▥' },
  lamp: { name: '조명', icon: '☀' },
  cushion: { name: '쿠션', icon: '◆' },
};

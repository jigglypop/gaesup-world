import type { SceneDocument } from 'gaesup-world';

import type { RoomSettings } from './roomTypes';
import type { RoomTerrain } from './terrain';

export type FurnitureKind = 'sofa' | 'table' | 'plant' | 'shelf' | 'lamp' | 'cushion' | 'tree' | 'bench' | 'desk' | 'neon' | 'fountain' | 'arcade';
export type RoomTheme = 'peach' | 'sage' | 'lavender';
export type HomeTab = 'home' | 'diary' | 'guestbook';
export type HomeNote = { id: string; author: string; text: string; date: string };
export type MinihomeData = {
  version: 1;
  profile: { name: string; title: string; bio: string; mood: string };
  theme: RoomTheme;
  roomSettings: RoomSettings;
  room: SceneDocument;
  terrain: RoomTerrain;
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
  tree: { name: '나무', icon: '♠' },
  bench: { name: '벤치', icon: '▰' },
  desk: { name: '작업 책상', icon: '▣' },
  neon: { name: '네온 조형물', icon: '✦' },
  fountain: { name: '분수', icon: '⛲' },
  arcade: { name: '아케이드', icon: '▧' },
};

import type { SceneDocument } from 'gaesup-world';

import type { RoomSettings } from './roomTypes';
import type { RoomTerrain } from './terrain';

export const FARM_KINDS = ['pumpkin-bed', 'carrot-bed', 'turnip-bed', 'corn-bed', 'wheat-bed', 'tomato-bed', 'picket-fence', 'log-fence', 'lattice-fence', 'fruit-tree', 'leafy-tree', 'string-lights', 'lantern', 'milk-can', 'wagon', 'water-trough', 'garden-sign', 'flower-pot', 'log-pile'] as const;
export type FarmKind = typeof FARM_KINDS[number];
export type FurnitureKind = 'sofa' | 'table' | 'plant' | 'shelf' | 'lamp' | 'cushion' | 'tree' | 'bench' | 'desk' | 'neon' | 'fountain' | 'arcade' | FarmKind;
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
  'pumpkin-bed': { name: '호박밭', icon: '🎃' },
  'carrot-bed': { name: '당근밭', icon: '🥕' },
  'turnip-bed': { name: '순무밭', icon: '◍' },
  'corn-bed': { name: '옥수수밭', icon: '🌽' },
  'wheat-bed': { name: '밀밭', icon: '🌾' },
  'tomato-bed': { name: '토마토밭', icon: '🍅' },
  'picket-fence': { name: '흰 울타리', icon: '⩘' },
  'log-fence': { name: '통나무 울타리', icon: '═' },
  'lattice-fence': { name: '격자 울타리', icon: '▦' },
  'fruit-tree': { name: '과일나무', icon: '🍊' },
  'leafy-tree': { name: '큰 나무', icon: '🌳' },
  'string-lights': { name: '전구 줄', icon: '💡' },
  lantern: { name: '랜턴', icon: '🏮' },
  'milk-can': { name: '우유통', icon: '🥛' },
  wagon: { name: '포장 수레', icon: '🛒' },
  'water-trough': { name: '수돗가', icon: '🚰' },
  'garden-sign': { name: '텃밭 표지판', icon: '🪧' },
  'flower-pot': { name: '꽃 화분', icon: '🌷' },
  'log-pile': { name: '장작더미', icon: '🪵' },
};

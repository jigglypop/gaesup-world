import * as THREE from 'three';

import type { CameraOptionType, NPCSchedule } from '../../../src';
import type { SakuraTreeEntry, SandEntry, SnowfieldEntry } from '../../../src/core/building';

export const RICH_CAMERA_OPTION: CameraOptionType = {
  xDistance: -7,
  yDistance: 10,
  zDistance: -13,
  offset: new THREE.Vector3(0, 0, 0),
  enableCollision: true,
  smoothing: { position: 0.25, rotation: 0.3, fov: 0.2 },
  fov: 75,
  zoom: 1,
  enableZoom: true,
  zoomSpeed: 0.001,
  minZoom: 0.5,
  maxZoom: 2.0,
  enableFocus: true,
  focusDistance: 15,
  focusDuration: 1,
  focusLerpSpeed: 5.0,
  maxDistance: 50,
  distance: 10,
  bounds: { minY: 2, maxY: 50 },
};

export const WORLD_WEATHER_ENABLED = false;
export const DEFAULT_TOON_MODE = false;

export const SAKURA_TREES: SakuraTreeEntry[] = [
  { position: [-22, 0, -10], size: 4.4, blossomColor: '#ffb6c1' },
  { position: [22, 0, -8], size: 4.0, blossomColor: '#ffc4d6' },
  { position: [-26, 0, 6], size: 4.8, blossomColor: '#ffb0c8' },
  { position: [26, 0, 10], size: 4.0, blossomColor: '#ffd0e0' },
  { position: [-18, 0, 22], size: 3.6, blossomColor: '#ffc8db' },
  { position: [18, 0, 24], size: 4.4, blossomColor: '#ffb6c1' },
  { position: [-30, 0, -22], size: 3.2, blossomColor: '#ffc4d6' },
  { position: [30, 0, -20], size: 3.6, blossomColor: '#ffb0c8' },
  { position: [-12, 0, -28], size: 3.2, blossomColor: '#ffd0e0' },
  { position: [14, 0, -26], size: 4.0, blossomColor: '#ffb6c1' },
];

export const SAND_TILES: SandEntry[] = [
  { position: [40, 0, 0], size: 6 },
  { position: [46, 0, 0], size: 6 },
  { position: [40, 0, 6], size: 6 },
  { position: [46, 0, 6], size: 6 },
  { position: [40, 0, -6], size: 6 },
  { position: [46, 0, -6], size: 6 },
];

export const SNOWFIELD_TILES: SnowfieldEntry[] = [
  { position: [-40, 0, 0], size: 6 },
  { position: [-46, 0, 0], size: 6 },
  { position: [-40, 0, 6], size: 6 },
  { position: [-46, 0, 6], size: 6 },
  { position: [-40, 0, -6], size: 6 },
  { position: [-46, 0, -6], size: 6 },
];

export type WorldNpc = {
  id: string;
  name: string;
  pos: [number, number, number];
  accentColor?: string;
  dialogTreeId: string;
};

export const NPCS: WorldNpc[] = [
  { id: 'tommy', name: '토미', pos: [0, 0, -8], accentColor: '#ff9f6e', dialogTreeId: 'npc.shopkeeper' },
  { id: 'mei', name: '메이', pos: [6, 0, 0], accentColor: '#7fc6ff', dialogTreeId: 'npc.villager' },
  { id: 'ryu', name: '류', pos: [-6, 0, 0], accentColor: '#85d878', dialogTreeId: 'npc.craftsman' },
];

export const NPC_SCHEDULES: NPCSchedule[] = [
  {
    npcId: 'tommy',
    defaultEntry: { position: [0, 0, -8], activity: 'idle' },
    entries: [
      { startHour: 6, endHour: 9, position: [-2, 0, -8], activity: 'idle' },
      { startHour: 9, endHour: 18, position: [0, 0, -8], activity: 'shop' },
      { startHour: 18, endHour: 22, position: [4, 0, -6], activity: 'idle' },
      { startHour: 22, endHour: 6, position: [-1, 0, -10], activity: 'sleep' },
    ],
  },
  {
    npcId: 'mei',
    defaultEntry: { position: [6, 0, 0], activity: 'idle' },
    entries: [
      { startHour: 7, endHour: 11, position: [6, 0, 0], activity: 'idle' },
      { startHour: 11, endHour: 16, position: [10, 0, 14], activity: 'work' },
      { startHour: 16, endHour: 21, position: [6, 0, 0], activity: 'idle' },
      { startHour: 21, endHour: 7, position: [4, 0, -2], activity: 'sleep' },
    ],
  },
  {
    npcId: 'ryu',
    defaultEntry: { position: [-6, 0, 0], activity: 'idle' },
    entries: [
      { startHour: 8, endHour: 19, position: [-6, 0, 0], activity: 'work' },
      { startHour: 19, endHour: 23, position: [-4, 0, 4], activity: 'idle' },
      { startHour: 23, endHour: 8, position: [-7, 0, -2], activity: 'sleep' },
    ],
  },
];

export const BUG_SPOTS: Array<[number, number, number]> = [
  [-22, 0, -10],
  [22, 0, -8],
  [0, 0, 50],
];

export const CROP_PLOTS: Array<{ id: string; pos: [number, number, number] }> = [
  { id: 'plot-a', pos: [12, 0, 12] },
  { id: 'plot-b', pos: [13.6, 0, 12] },
  { id: 'plot-c', pos: [12, 0, 13.6] },
  { id: 'plot-d', pos: [13.6, 0, 13.6] },
  { id: 'plot-e', pos: [10.4, 0, 12] },
  { id: 'plot-f', pos: [10.4, 0, 13.6] },
];

export const HOUSE_PLOTS: Array<{ id: string; pos: [number, number, number] }> = [
  { id: 'house-1', pos: [-18, 0, 18] },
  { id: 'house-2', pos: [-12, 0, 18] },
  { id: 'house-3', pos: [-6, 0, 18] },
];

export const PICKUPS: Array<{ id: string; itemId: string; count: number; pos: [number, number, number] }> = [
  { id: 'apple-1', itemId: 'apple', count: 1, pos: [3, 0, 3] },
  { id: 'apple-2', itemId: 'apple', count: 1, pos: [-3, 0, 3] },
  { id: 'apple-3', itemId: 'apple', count: 1, pos: [0, 0, 5] },
  { id: 'wood-1', itemId: 'wood', count: 2, pos: [-20, 0, -10] },
  { id: 'wood-2', itemId: 'wood', count: 2, pos: [20, 0, -8] },
  { id: 'flower-1', itemId: 'flower-pink', count: 1, pos: [4, 0, -4] },
  { id: 'shell-1', itemId: 'shell', count: 1, pos: [44, 0, 2] },
  { id: 'stone-1', itemId: 'stone', count: 1, pos: [-44, 0, -2] },
];

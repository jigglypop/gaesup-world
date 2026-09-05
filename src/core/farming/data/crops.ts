import { getCropRegistry } from '../registry/CropRegistry';
import type { CropDef } from '../types';

export const SEED_CROPS: CropDef[] = [
  {
    id: 'crop.turnip',
    name: '순무',
    seedItemId: 'seed-turnip',
    yieldItemId: 'turnip',
    yieldCount: 2,
    waterIntervalMinutes: 60 * 8,
    driedOutMinutes: 60 * 16,
    stages: [
      { durationMinutes: 60 * 6,  scale: 0.3, color: '#8acf8a' },
      { durationMinutes: 60 * 8,  scale: 0.6, color: '#a8df9c', needsWater: true },
      { durationMinutes: 60 * 10, scale: 0.9, color: '#cfeeb6', needsWater: true },
      { durationMinutes: 0,        scale: 1.0, color: '#ffeeaa' },
    ],
  },
  {
    id: 'crop.tomato',
    name: '토마토',
    seedItemId: 'seed-tomato',
    yieldItemId: 'tomato',
    yieldCount: 3,
    waterIntervalMinutes: 60 * 6,
    driedOutMinutes: 60 * 12,
    stages: [
      { durationMinutes: 60 * 8,  scale: 0.3, color: '#7adf90' },
      { durationMinutes: 60 * 12, scale: 0.6, color: '#9adf90', needsWater: true },
      { durationMinutes: 60 * 12, scale: 0.9, color: '#cfdf90', needsWater: true },
      { durationMinutes: 0,        scale: 1.1, color: '#e54b4b' },
    ],
  },
];

let _registered = false;
export function registerSeedCrops(): void {
  if (_registered) return;
  _registered = true;
  getCropRegistry().registerAll(SEED_CROPS);
}

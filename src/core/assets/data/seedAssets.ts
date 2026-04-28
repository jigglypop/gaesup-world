import type { AssetRecord } from '../types';

export const SEED_ASSETS: AssetRecord[] = [
  {
    id: 'warrior-cloth-rabbit',
    name: 'Rabbit Warrior Cloth',
    kind: 'characterPart',
    slot: 'top',
    url: 'gltf/ally_cloth_rabbit.glb',
    tags: ['starter', 'cloth'],
  },
  {
    id: 'warrior-cloth-basic',
    name: 'Basic Warrior Cloth',
    kind: 'characterPart',
    slot: 'top',
    url: 'gltf/ally_cloth.glb',
    tags: ['starter', 'cloth'],
  },
  {
    id: 'ally-hat',
    name: 'Ally Hat',
    kind: 'characterPart',
    slot: 'hat',
    url: 'gltf/ally_hat.glb',
    tags: ['starter', 'hat'],
  },
  {
    id: 'ally-glasses',
    name: 'Ally Glasses',
    kind: 'characterPart',
    slot: 'face',
    url: 'gltf/ally_glass.glb',
    tags: ['starter', 'face'],
  },
  {
    id: 'starter-weapon-layer',
    name: 'Starter Weapon Layer',
    kind: 'weapon',
    slot: 'weapon',
    url: 'gltf/ally_cloth.glb',
    tags: ['starter', 'weapon', 'placeholder'],
    metadata: {
      placeholder: true,
    },
  },
  {
    id: 'wall-soft-brick',
    name: 'Soft Brick Wall',
    kind: 'wall',
    tags: ['building', 'wall', 'brick'],
    colors: {
      primary: '#b8795f',
    },
    metadata: {
      material: 'STANDARD',
      roughness: 0.72,
    },
  },
  {
    id: 'tile-warm-wood',
    name: 'Warm Wood Tile',
    kind: 'tile',
    tags: ['building', 'tile', 'wood'],
    colors: {
      primary: '#8b5a35',
    },
    metadata: {
      material: 'STANDARD',
      roughness: 0.58,
    },
  },
  {
    id: 'material-glass-blue',
    name: 'Blue Glass',
    kind: 'material',
    tags: ['building', 'material', 'glass'],
    colors: {
      primary: '#9bd7ff',
    },
    metadata: {
      material: 'GLASS',
      opacity: 0.45,
      transparent: true,
      roughness: 0.1,
    },
  },
];

import type { BuildingModelFallbackKind } from '../types';

export type BuildingObjectCatalogItem = {
  id: string;
  label: string;
  category: 'structure' | 'furniture' | 'utility' | 'shop' | 'decor' | 'nature';
  fallbackKind: BuildingModelFallbackKind;
  defaultScale: number;
  defaultColor: string;
  modelUrl?: string;
  /**
   * Shadow casting: `all` cascades for large objects such as trees, `near` (default) for the nearest cascade only, which
   * is all a small prop's shadow needs, or `none`.
   */
  shadow?: 'all' | 'near' | 'none';
};

/** `defaultScale` sizes each model to a 1.7m character: a 2.1m door, a 2.1m bed, a 0.74m table. */
export const DEFAULT_BUILDING_OBJECT_CATALOG: BuildingObjectCatalogItem[] = [
  { id: 'door-basic', label: '문', category: 'structure', fallbackKind: 'door', defaultScale: 0.5, defaultColor: '#8b5a2b', modelUrl: 'gltf/props/door.glb' },
  { id: 'window-basic', label: '창문', category: 'structure', fallbackKind: 'window', defaultScale: 2.5, defaultColor: '#9fd3ff', modelUrl: 'gltf/props/window.glb' },
  { id: 'fence-basic', label: '울타리', category: 'structure', fallbackKind: 'fence', defaultScale: 1, defaultColor: '#8f6a3d', modelUrl: 'gltf/props/fence.glb' },
  { id: 'lamp-basic', label: '조명', category: 'utility', fallbackKind: 'lamp', defaultScale: 1.5, defaultColor: '#ffd166', modelUrl: 'gltf/props/lamp.glb' },
  { id: 'chair-basic', label: '의자', category: 'furniture', fallbackKind: 'chair', defaultScale: 0.65, defaultColor: '#a6784f', modelUrl: 'gltf/props/chair.glb' },
  { id: 'table-basic', label: '탁자', category: 'furniture', fallbackKind: 'table', defaultScale: 0.9, defaultColor: '#9b6b43', modelUrl: 'gltf/props/table.glb' },
  { id: 'bed-basic', label: '침대', category: 'furniture', fallbackKind: 'bed', defaultScale: 0.5, defaultColor: '#7aa2ff', modelUrl: 'gltf/props/bed.glb' },
  { id: 'storage-basic', label: '수납장', category: 'furniture', fallbackKind: 'storage', defaultScale: 0.45, defaultColor: '#7c5c3e', modelUrl: 'gltf/props/storage.glb' },
  { id: 'mailbox-basic', label: '우편함', category: 'utility', fallbackKind: 'mailbox', defaultScale: 1.25, defaultColor: '#d04f45', modelUrl: 'gltf/props/mailbox.glb' },
  { id: 'crafting-basic', label: '제작대', category: 'utility', fallbackKind: 'crafting', defaultScale: 1, defaultColor: '#b68553', modelUrl: 'gltf/props/crafting.glb' },
  { id: 'shop-stall-basic', label: '가판대', category: 'shop', fallbackKind: 'shop', defaultScale: 2, defaultColor: '#d88f45', modelUrl: 'gltf/props/shop-stall.glb' },
  // Matte low-poly nature (gltf/nature: choketmonster's own cute set; gltf/nature/kenney: Kenney Nature Kit, CC0).
  ...nature([
    ['tree-round', '둥근 나무', 1, 'all'], ['tree-oak', '열매 나무', 1, 'all'], ['tree-pine', '소나무', 1, 'all'],
    ['tree-fat', '통통한 나무', 1, 'all'], ['tree-thin', '가는 나무', 1, 'all'],
    ['rock-round', '둥근 바위', 0.55, 'all'], ['rock-wide', '넓은 바위', 0.55, 'all'], ['rock-tall', '높은 바위', 0.55, 'all'],
    ['fern', '고사리', 1.2],
    ['kenney/bush', '덤불', 1], ['kenney/flower-red', '빨간 꽃', 1], ['kenney/flower-yellow', '노란 꽃', 1],
    ['kenney/flower-purple', '보라 꽃', 1], ['kenney/stump', '그루터기', 1], ['kenney/fallen-log', '쓰러진 통나무', 1],
    ['kenney/mushroom-cluster', '버섯', 1], ['kenney/lily', '연꽃', 1], ['kenney/rock-small', '작은 돌', 1],
    ['kenney/rock-flat', '납작 돌', 1], ['kenney/rock-moss', '이끼 바위', 0.7], ['kenney/rock-large', '큰 바위', 0.6],
  ]),
];

function nature(entries: [path: string, label: string, scale: number, shadow?: 'all'][]): BuildingObjectCatalogItem[] {
  return entries.map(([path, label, scale, shadow]) => ({
    id: `nature-${path.split('/').at(-1)}`,
    label,
    category: 'nature',
    fallbackKind: 'generic',
    defaultScale: scale,
    defaultColor: '#6fae5b',
    modelUrl: `gltf/nature/${path}.glb`,
    ...(shadow ? { shadow } : {}),
  }));
}

export function getDefaultBuildingObject(id: string): BuildingObjectCatalogItem | undefined {
  return DEFAULT_BUILDING_OBJECT_CATALOG.find((item) => item.id === id);
}

import type { AssetRecord } from 'gaesup-world';

export const WORLD_AVATARS = [
  { id: 'kaykit-rogue', name: '숲길 여행자', url: 'gltf/kaykit/rogue.glb' },
  { id: 'kaykit-rogue-hooded', name: '후드 여행자', url: 'gltf/kaykit/rogue-hooded.glb' },
  { id: 'kaykit-mage', name: '작은 마법사', url: 'gltf/kaykit/mage.glb' },
  { id: 'kaykit-knight', name: '마을 기사', url: 'gltf/kaykit/knight.glb' },
] as const;

export const WORLD_EQUIPMENT: AssetRecord[] = [
  ['sword', '검'], ['axe', '도끼'], ['staff', '지팡이'],
].map(([id, name]) => ({
  id: `kaykit-${id}`, name: name!, kind: 'weapon', slot: 'weapon',
  url: `gltf/kaykit/${id}.glb`, tags: ['kaykit', 'equipment', 'cc0'],
  metadata: {
    license: 'CC0-1.0', author: 'Kay Lousberg', skeleton: 'kaykit-adventurers-1',
    deformation: 'rigid',
    attachment: { bone: 'handslot_r', socket: 'rightHand', position: [0, 0, 0] },
  },
}));

export const WORLD_REFERENCE_ASSETS: AssetRecord[] = [
  ...WORLD_AVATARS.map((avatar): AssetRecord => ({
    ...avatar, kind: 'characterPart', slot: 'top', tags: ['kaykit', 'character-preset', 'cc0'],
    metadata: { license: 'CC0-1.0', author: 'Kay Lousberg', characterPreset: true },
  })),
  ...WORLD_EQUIPMENT,
  ...[['tree-oak', '둥근 활엽수'], ['tree-pine', '키 큰 침엽수'], ['tile-grass', '육각 잔디 타일']].map(([id, name]): AssetRecord => ({
    id: `kaykit-${id}`, name: name!, kind: 'object3d', url: `gltf/kaykit/${id}.glb`,
    tags: ['kaykit', 'building', 'cc0'], metadata: { license: 'CC0-1.0', author: 'Kay Lousberg' },
  })),
];

export function resolveWorldAvatar(outfitId: string | null) {
  return WORLD_AVATARS.find((avatar) => avatar.id === outfitId) ?? WORLD_AVATARS[0];
}

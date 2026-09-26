import { getDefaultBuildingObject, type BuildingSerializedState, type MeshConfig, type PlacedObject, type TileConfig, type WallConfig } from 'gaesup-world/building';

/** Grid cell in meters; one character (1.7m) is a little under half a cell. */
export const CELL = 4;

/**
 * The island, one character per 4m cell, north at the top.
 * T forest cliff · . lawn · = sand path · ~ pond · " tall grass · * flower bed · # field · F miniroom floor · s beach
 */
const MAP = [
  'TTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTT',
  'TT.FF...""""TT',
  'TT.FF...""""TT',
  'T.......=....T',
  'T.==========.T',
  'T.=..**.=....T',
  'T~~..**.=.##.T',
  'T~~""...=.##.T',
  'T~~""...==...T',
  'T.......=.""..',
  's.......=.""..',
  'ssssssss=sssss',
  'ssssssssssssss',
];
const SIDE = MAP.length;
const HALF = (SIDE * CELL) / 2;

/** Center of cell `index` on either axis. */
export const at = (index: number) => index * CELL - HALF + CELL / 2;
const cell = (x: number, z: number) => MAP[z]?.[x] ?? 's';

/** Where the player starts: the crossroads south of the miniroom. */
export const SPAWN: [number, number, number] = [at(8), 1, at(5)];
/** The miniroom's floor cells. */
export const ROOM = { x0: 3, x1: 4, z0: 2, z1: 3 };

/** Blades per m² of a tall grass patch. */
const TALL_GRASS = 52;

// Small SVG textures: one tile face shows the whole image, so each is drawn at 4m scale.
const svg = (body: string, background: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="${background}"/>${body}</svg>`,
  )}`;
const scatter = (count: number, seed: number, draw: (x: number, y: number, i: number) => string) =>
  Array.from({ length: count }, (_, i) => {
    const r = (n: number) => Math.abs(Math.sin((i + 1) * 12.9898 + seed * 78.233 + n) * 43758.5453) % 1;
    return draw(Math.round(r(1) * 120) + 4, Math.round(r(2) * 120) + 4, i);
  }).join('');

const LAWN = svg(
  '<path d="M0 0h64v64H0zM64 64h64v64H64z" fill="#97d56f"/>' +
    scatter(22, 1, (x, y) => `<path d="M${x} ${y}l-2 -5M${x} ${y}l2 -5" stroke="#76b852" stroke-width="2" stroke-linecap="round"/>`),
  '#8ccd65',
);
const PATH = svg(scatter(26, 2, (x, y, i) => `<circle cx="${x}" cy="${y}" r="${1.5 + (i % 3)}" fill="${i % 2 ? '#e3c894' : '#fbeccc'}"/>`), '#f0dcaa');
const FLOWERS = svg(
  scatter(40, 3, (x, y, i) => {
    const petal = ['#ff8fb1', '#ffffff', '#ffb3c9', '#fff3a8'][i % 4];
    return `<circle cx="${x}" cy="${y}" r="5" fill="${petal}"/><circle cx="${x}" cy="${y}" r="2" fill="#ffc53d"/>`;
  }),
  '#6fbf53',
);
const FIELD = svg(
  [16, 48, 80, 112].map((y) => `<rect x="6" y="${y - 9}" width="116" height="18" rx="9" fill="#6b4529"/>`).join('') +
    [16, 48, 80, 112].map((y) => [20, 44, 68, 92, 112].map((x) => `<path d="M${x} ${y}c-6-8-2-12 0-12c2 0 6 4 0 12zM${x} ${y}c6-6 10-4 8 0" fill="#5fbf45"/>`).join('')).join(''),
  '#8a5f3a',
);
const PLANKS = svg([0, 32, 64, 96].map((y, i) => `<rect y="${y}" width="128" height="31" fill="${i % 2 ? '#d9ab73' : '#d3a36a'}"/><path d="M${40 + i * 24} ${y}v31" stroke="#b98a52" stroke-width="2"/>`).join(''), '#b98a52');

const MESHES: MeshConfig[] = [
  { id: 'lawn', color: '#ffffff', mapTextureUrl: LAWN, roughness: 0.95 },
  { id: 'path', color: '#ffffff', mapTextureUrl: PATH, roughness: 1 },
  { id: 'flowers', color: '#ffffff', mapTextureUrl: FLOWERS, roughness: 0.9 },
  { id: 'field', color: '#ffffff', mapTextureUrl: FIELD, roughness: 1 },
  { id: 'floor', color: '#ffffff', mapTextureUrl: PLANKS, roughness: 0.7 },
  { id: 'wallpaper', color: '#ffe8ec' },
  { id: 'wall-outside', color: '#fff7ec' },
];

const MATERIAL: Record<string, string> = { '.': 'lawn', T: 'lawn', '=': 'path', '*': 'flowers', '#': 'field', F: 'floor' };
const DIRT = { terrainColor: '#a57b52', terrainAccentColor: '#7f5b3a' };

function tileAt(x: number, z: number): TileConfig {
  const kind = cell(x, z);
  const raised = kind === 'T';
  const base = { id: `tile-${x}-${z}`, tileGroupId: 'ground', size: 1, position: { x: at(x), y: raised ? 1 : 0, z: at(z) } };
  if (kind === '~') return { ...base, objectType: 'water' };
  if (kind === 's') return { ...base, objectType: 'sand' };
  if (kind === '"') return { ...base, materialId: 'lawn', objectType: 'grass', objectConfig: { grassDensity: TALL_GRASS } };
  return { ...base, materialId: MATERIAL[kind] ?? 'lawn', ...(raised ? { objectConfig: DIRT } : {}) };
}

const model = (id: string, catalogId: string, x: number, z: number, rotation = 0): PlacedObject => {
  const item = getDefaultBuildingObject(catalogId)!;
  return {
    id,
    type: 'model',
    position: { x, y: 0, z },
    rotation,
    config: { modelId: item.id, modelLabel: item.label, modelScale: item.defaultScale, modelFallbackKind: item.fallbackKind, ...(item.modelUrl ? { modelUrl: item.modelUrl } : {}) },
  };
};

type TreeKind = NonNullable<NonNullable<PlacedObject['config']>['treeKind']>;
const tree = (id: string, treeKind: TreeKind, x: number, z: number, size = 4, y = 0): PlacedObject =>
  ({ id, type: treeKind === 'sakura' ? 'sakura' : 'tree', position: { x, y, z }, config: { treeKind, size } });

/** A pine on every forest cell, nudged off the grid so the edge reads as woods, not a row. */
function forest(): PlacedObject[] {
  const trees: PlacedObject[] = [];
  for (let z = 0; z < SIDE; z++) {
    for (let x = 0; x < SIDE; x++) {
      if (cell(x, z) !== 'T') continue;
      const jitter = (n: number) => (Math.sin((x * 31 + z * 17 + n) * 12.9898) * 43758.5453 % 1) * 1.2;
      trees.push(tree(`pine-${x}-${z}`, 'pine', at(x) + jitter(1), at(z) + jitter(2), 4.5 + Math.abs(jitter(3)), 1));
    }
  }
  return trees;
}

/** The fence around the field, one catalog fence per cell edge. */
function fieldFence(): PlacedObject[] {
  const [x0, x1, z0, z1] = [at(10) - CELL / 2, at(11) + CELL / 2, at(7) - CELL / 2, at(8) + CELL / 2];
  const posts: PlacedObject[] = [];
  for (const x of [at(10), at(11)]) {
    posts.push(model(`fence-n-${x}`, 'fence-basic', x, z0));
    posts.push(model(`fence-s-${x}`, 'fence-basic', x, z1));
  }
  for (const z of [at(7), at(8)]) posts.push(model(`fence-e-${z}`, 'fence-basic', x1, z, Math.PI / 2));
  posts.push(model('fence-w', 'fence-basic', x0, at(7), Math.PI / 2));
  return posts;
}

export function createVillage(): BuildingSerializedState {
  const tiles: TileConfig[] = [];
  for (let z = 0; z < SIDE; z++) for (let x = 0; x < SIDE; x++) tiles.push(tileAt(x, z));

  // The miniroom: two back walls (north and west) like a Cyworld miniroom, open toward the camera.
  const north = at(ROOM.z0) - CELL / 2;
  const west = at(ROOM.x0) - CELL / 2;
  const walls: WallConfig[] = [];
  for (let x = ROOM.x0; x <= ROOM.x1; x++) {
    walls.push({ id: `room-north-${x}`, wallGroupId: 'room', position: { x: at(x), y: 0, z: north }, rotation: { x: 0, y: 0, z: 0 }, ...(x === ROOM.x1 ? { wallKind: 'window' as const } : {}) });
  }
  for (let z = ROOM.z0; z <= ROOM.z1; z++) {
    walls.push({ id: `room-west-${z}`, wallGroupId: 'room', position: { x: west, y: 0, z: at(z) }, rotation: { x: 0, y: Math.PI / 2, z: 0 }, ...(z === ROOM.z1 ? { wallKind: 'window' as const } : {}) });
  }

  const objects: PlacedObject[] = [
    // Miniroom furniture, sized by the catalog for a 1.7m character.
    model('room-bed', 'bed-basic', west + 1.6, north + 1.6),
    model('room-wardrobe', 'storage-basic', west + 4.6, north + 0.5),
    model('room-lamp', 'lamp-basic', west + 3, north + 0.5),
    model('room-table', 'table-basic', west + 5, north + 5),
    model('room-chair-a', 'chair-basic', west + 5, north + 3.9),
    model('room-chair-b', 'chair-basic', west + 5, north + 6.1, Math.PI),
    model('room-crafting', 'crafting-basic', west + 0.6, north + 6, Math.PI / 2),
    {
      id: 'room-frame', type: 'billboard', position: { x: west + 6, y: 0, z: north + 0.3 },
      config: { billboardText: 'HAPPY ISLAND', billboardColor: '#ff8a65', billboardWidth: 1.8, billboardHeight: 0.7, billboardElevation: 2.2 },
    },
    // Village.
    model('mailbox', 'mailbox-basic', at(5) + 1, at(4) - 1),
    model('stall', 'shop-stall-basic', at(10), at(4), Math.PI),
    ...fieldFence(),
    { id: 'campfire', type: 'fire', position: { x: at(4), y: 0, z: at(12) }, config: { fireIntensity: 1.2 } },
    { id: 'plaza-flag', type: 'flag', position: { x: at(9) + 1.2, y: 0, z: at(9) - 1.2 }, config: { flagWidth: 1.6, flagHeight: 1, flagStyle: 'flag', primaryColor: '#ff8a65' } },
    { id: 'notice', type: 'billboard', position: { x: at(7), y: 0, z: at(4) + 1.4 }, config: { billboardText: '미니홈피 섬', billboardColor: '#2bb3a3', billboardWidth: 2.2, billboardHeight: 0.8, billboardElevation: 1.3 } },
    tree('oak-1', 'oak', at(2), at(4)),
    tree('oak-2', 'oak', at(12), at(4)),
    tree('oak-3', 'oak', at(6), at(9) + 1),
    tree('oak-4', 'oak', at(12), at(9), 3.6),
    tree('maple-1', 'maple', at(1), at(10), 3.6),
    tree('sakura-1', 'sakura', at(7) - 1, at(7) - 1, 3.4),
    tree('sakura-2', 'sakura', at(2), at(7) - 1.5, 3.2),
    tree('willow-pond', 'willow', at(3), at(9)),
    ...forest(),
  ];

  return {
    version: 1,
    meshes: MESHES,
    tileGroups: [{ id: 'ground', name: 'ground', floorMeshId: 'lawn', tiles }],
    wallGroups: [{ id: 'room', name: '미니룸', frontMeshId: 'wallpaper', backMeshId: 'wall-outside', sideMeshId: 'wall-outside', walls }],
    blocks: [],
    objects,
    showSnow: false,
    showFog: false,
    fogColor: '#dcefff',
    weatherEffect: 'none',
    worldSurface: 'water',
  };
}

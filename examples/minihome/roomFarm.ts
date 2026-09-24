import { Group, Matrix4, Mesh, Quaternion, Vector3, type BufferGeometry, type Material } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import type { FarmKind } from './types';

type Shape = 'box' | 'sphere' | 'cylinder' | 'cone';
type Vec3 = [number, number, number];
type FarmModel = 'pumpkin' | 'carrot' | 'turnip' | 'corn' | 'wheat' | 'sprout' | 'log-stack' | 'pot' | 'flower-red' | 'bush';
type TemplatePart = { geometry: BufferGeometry; material: Material; matrix: Matrix4 };
export type FarmLibrary = { place: (parent: Group, id: FarmModel, position: Vec3, scale?: number, rotationY?: number) => void; dispose: () => void };
export type FarmKit = {
  part: (color: string, scale: Vec3, position: Vec3, shape?: Shape, rotation?: Vec3) => Mesh;
  lit: (color: string, scale: Vec3, position: Vec3, shape?: Shape) => Mesh;
  library: FarmLibrary;
};

export const FARM_LIBRARY_URL = 'gltf/farm/farm-library.glb';
const PALETTE = {
  rim: '#8ea85a', soil: '#8a5a38', ridge: '#a06d45', stake: '#a07c52', leaf: '#6e8d45', leafLight: '#86a454',
  tomato: '#d8483a', picket: '#f3eee1', log: '#9a7148', rail: '#b08658', lattice: '#83b2a8', orange: '#ef8d34',
  pole: '#a3845e', bulb: '#fff1c4', wire: '#5d4c3b', metal: '#4b453e', glass: '#ffd98a', can: '#c9ba9c',
  canDark: '#9a8c70', wagon: '#9c7650', wheel: '#6e5236', canvas: '#efe6d1', stone: '#d6cdb9', water: '#8fc2cb',
  tap: '#8e949a', board: '#c49a6c', plaque: '#f0e3c1', bark: '#8f6a48', crown: '#a3b86a', crownLight: '#bfcd83',
} as const;
// Overlapping leaf clumps [x, y, z, radius] give the soft, layered crowns of the reference trees.
const CROWN: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, 2.35, 0, 1.05], [-0.8, 2.05, 0.25, 0.78], [0.8, 2.1, -0.15, 0.8], [0.15, 2, 0.8, 0.75], [-0.1, 2.05, -0.8, 0.75], [0.25, 3.05, 0.1, 0.72], [-0.45, 2.8, -0.35, 0.6],
];
const GRID3 = [-0.8, 0, 0.8] as const;
const jitter = (seed: number) => { const value = Math.sin(seed * 12.9898) * 43758.5453; return (value - Math.floor(value) - 0.5) * 0.12; };

/** Loads the CC0 Kenney farm library once; parts share geometry/material so room batches instance them. */
export async function loadFarmLibrary(url: string): Promise<FarmLibrary> {
  const gltf = await new GLTFLoader().loadAsync(url);
  gltf.scene.updateMatrixWorld(true);
  const templates = new Map<string, TemplatePart[]>(); const inverse = new Matrix4();
  for (const root of gltf.scene.children) {
    inverse.copy(root.matrixWorld).invert();
    const parts: TemplatePart[] = [];
    root.traverse((object) => {
      if (!(object instanceof Mesh) || Array.isArray(object.material)) return;
      parts.push({ geometry: object.geometry, material: object.material, matrix: new Matrix4().multiplyMatrices(inverse, object.matrixWorld) });
    });
    templates.set(root.name.replace(/-root$/, ''), parts);
  }
  const placement = new Matrix4(); const local = new Matrix4(); const rotation = new Quaternion();
  const offset = new Vector3(); const size = new Vector3(); const up = new Vector3(0, 1, 0);
  return {
    place(parent, id, position, scale = 1, rotationY = 0) {
      const parts = templates.get(id); if (!parts) return;
      placement.compose(offset.fromArray(position), rotation.setFromAxisAngle(up, rotationY), size.setScalar(scale));
      for (const part of parts) {
        const mesh = new Mesh(part.geometry, part.material); mesh.castShadow = true; mesh.receiveShadow = true;
        local.multiplyMatrices(placement, part.matrix); local.decompose(mesh.position, mesh.quaternion, mesh.scale);
        parent.add(mesh);
      }
    },
    dispose() {
      gltf.scene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        object.geometry.dispose();
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
      });
    },
  };
}

function bed(kit: FarmKit, width: number, depth: number, rows: number): void {
  kit.part(PALETTE.rim, [width + 0.36, 0.06, depth + 0.36], [0, 0.03, 0]);
  kit.part(PALETTE.soil, [width, 0.16, depth], [0, 0.08, 0]);
  for (let row = 0; row < rows; row++) kit.part(PALETTE.ridge, [width * 0.9, 0.05, 0.16], [0, 0.18, (row - (rows - 1) / 2) * (depth / rows)]);
}

function tree(kit: FarmKit): void {
  kit.part(PALETTE.bark, [0.24, 1.9, 0.24], [0, 0.95, 0], 'cylinder');
  for (const [index, [x, y, z, radius]] of CROWN.entries()) kit.part(index % 2 ? PALETTE.crownLight : PALETTE.crown, [radius, radius * 0.82, radius], [x, y, z], 'sphere');
}

function cropGrid(kit: FarmKit, group: Group, model: FarmModel, scale: number, columns: readonly number[] = GRID3, rows: readonly number[] = GRID3): void {
  let seed = 1;
  for (const x of columns) for (const z of rows) {
    kit.library.place(group, model, [x + jitter(seed), 0.18, z + jitter(seed + 7)], scale * (1 + jitter(seed + 3)), jitter(seed + 11) * 20);
    seed++;
  }
}

/** Builds farm-garden furniture in group-local space (origin at ground centre, +Z front). */
export function buildFarmFurniture(kind: FarmKind, group: Group, kit: FarmKit): void {
  const { part, lit, library } = kit;
  switch (kind) {
    case 'pumpkin-bed':
      bed(kit, 2.6, 2.6, 3); cropGrid(kit, group, 'pumpkin', 1.7);
      for (const x of [-0.4, 0.4]) for (const z of [-0.4, 0.4]) library.place(group, 'sprout', [x, 0.18, z], 0.7);
      break;
    case 'carrot-bed': bed(kit, 2.6, 2.6, 3); cropGrid(kit, group, 'carrot', 1.35); break;
    case 'turnip-bed': bed(kit, 2.6, 2.6, 3); cropGrid(kit, group, 'turnip', 1.35); break;
    case 'corn-bed': bed(kit, 2.6, 2.6, 2); cropGrid(kit, group, 'corn', 1.3, [-0.8, 0, 0.8], [-0.55, 0.55]); break;
    case 'wheat-bed': bed(kit, 2.6, 2.6, 3); cropGrid(kit, group, 'wheat', 1.5); break;
    case 'tomato-bed':
      bed(kit, 2.6, 2.6, 2);
      for (const [index, x] of GRID3.entries()) for (const z of [-0.6, 0.6]) {
        part(PALETTE.stake, [0.035, 1.35, 0.035], [x, 0.85, z], 'cylinder');
        part(PALETTE.leaf, [0.3, 0.4, 0.3], [x, 0.72, z], 'sphere');
        part(PALETTE.leafLight, [0.24, 0.3, 0.24], [x, 1.08, z + 0.02], 'sphere');
        for (const [dx, y, dz] of [[-0.2, 0.7, 0.18], [0.18, 0.95, 0.16], [-0.1, 1.2, 0.14], [0.14, 0.62, -0.2]] as const) {
          part(PALETTE.tomato, [0.1, 0.1, 0.1], [x + dx + jitter(index) * 0.5, y, z + dz], 'sphere');
        }
      }
      break;
    case 'picket-fence':
      for (const y of [0.3, 0.56]) part(PALETTE.picket, [2, 0.07, 0.04], [0, y, -0.035]);
      for (let x = -0.9; x <= 0.91; x += 0.3) {
        part(PALETTE.picket, [0.13, 0.6, 0.045], [x, 0.34, 0]);
        part(PALETTE.picket, [0.092, 0.092, 0.045], [x, 0.64, 0], 'box', [0, 0, Math.PI / 4]);
      }
      break;
    case 'log-fence':
      for (const x of [-0.95, 0.95]) part(PALETTE.log, [0.085, 0.8, 0.085], [x, 0.4, 0], 'cylinder');
      for (const y of [0.3, 0.6]) part(PALETTE.rail, [0.06, 2, 0.06], [0, y, 0], 'cylinder', [0, 0, Math.PI / 2]);
      break;
    case 'lattice-fence':
      for (const x of [-0.85, 0.85]) part(PALETTE.lattice, [0.1, 1.3, 0.1], [x, 0.65, 0]);
      for (const y of [0.12, 1.25]) part(PALETTE.lattice, [1.8, 0.08, 0.08], [0, y, 0]);
      for (let x = -0.6; x <= 0.61; x += 0.3) for (let y = 0.35; y <= 1.06; y += 0.35) {
        for (const tilt of [Math.PI / 4, -Math.PI / 4]) part(PALETTE.lattice, [0.04, 0.34, 0.03], [x, y, 0], 'box', [0, 0, tilt]);
      }
      break;
    case 'fruit-tree':
      tree(kit);
      for (let index = 0; index < 9; index++) {
        const angle = index * 2.4; const y = 1.95 + (index % 3) * 0.4;
        part(PALETTE.orange, [0.17, 0.17, 0.17], [Math.cos(angle) * 1.28, y, Math.sin(angle) * 1.18], 'sphere');
      }
      break;
    case 'leafy-tree': tree(kit); break;
    case 'string-lights': {
      const span = 1.7; const top = 2.35; const sag = 0.35; const count = 9;
      for (const x of [-span, span]) part(PALETTE.pole, [0.06, 2.5, 0.06], [x, 1.25, 0], 'cylinder');
      const height = (x: number) => top - sag * (1 - (x / span) ** 2);
      for (let index = 0; index < count; index++) {
        const x0 = -span + (index / count) * span * 2; const x1 = -span + ((index + 1) / count) * span * 2;
        const y0 = height(x0); const y1 = height(x1);
        part(PALETTE.wire, [Math.hypot(x1 - x0, y1 - y0), 0.015, 0.015], [(x0 + x1) / 2, (y0 + y1) / 2, 0], 'box', [0, 0, Math.atan2(y1 - y0, x1 - x0)]);
        if (index > 0) lit(PALETTE.bulb, [0.07, 0.09, 0.07], [x0, y0 - 0.08, 0], 'sphere');
      }
      break;
    }
    case 'lantern':
      part(PALETTE.metal, [0.28, 0.04, 0.28], [0, 0.02, 0]);
      lit(PALETTE.glass, [0.18, 0.24, 0.18], [0, 0.17, 0]);
      for (const [x, z] of [[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]] as const) part(PALETTE.metal, [0.025, 0.26, 0.025], [x, 0.17, z]);
      part(PALETTE.metal, [0.2, 0.13, 0.2], [0, 0.36, 0], 'cone');
      break;
    case 'milk-can':
      for (const [x, z] of [[-0.24, 0], [0.24, 0.08]] as const) {
        part(PALETTE.can, [0.2, 0.5, 0.2], [x, 0.25, z], 'cylinder');
        part(PALETTE.canDark, [0.205, 0.04, 0.205], [x, 0.32, z], 'cylinder');
        part(PALETTE.can, [0.13, 0.14, 0.13], [x, 0.57, z], 'cylinder');
        part(PALETTE.canDark, [0.16, 0.05, 0.16], [x, 0.66, z], 'cylinder');
      }
      break;
    case 'wagon':
      part(PALETTE.wagon, [1.7, 0.28, 0.95], [0, 0.62, 0]);
      part(PALETTE.canvas, [0.62, 1.55, 0.5], [0, 0.98, 0], 'cylinder', [0, 0, Math.PI / 2]);
      for (const x of [-0.78, 0.78]) part(PALETTE.board, [0.05, 0.42, 1], [x, 1.02, 0]);
      for (const x of [-0.6, 0.6]) for (const z of [-0.52, 0.52]) part(PALETTE.wheel, [0.34, 0.07, 0.34], [x, 0.34, z], 'cylinder', [Math.PI / 2, 0, 0]);
      part(PALETTE.wheel, [0.9, 0.06, 0.06], [1.25, 0.55, 0]);
      break;
    case 'water-trough':
      part(PALETTE.stone, [1.5, 0.5, 0.6], [0, 0.25, 0]);
      part(PALETTE.water, [1.34, 0.02, 0.44], [0, 0.49, 0]);
      part(PALETTE.stone, [1.5, 0.45, 0.1], [0, 0.72, -0.25]);
      for (const x of [-0.4, 0.4]) {
        part(PALETTE.tap, [0.03, 0.2, 0.03], [x, 0.98, -0.18], 'cylinder');
        part(PALETTE.tap, [0.025, 0.14, 0.025], [x, 0.9, -0.1], 'cylinder', [Math.PI / 2, 0, 0]);
      }
      break;
    case 'garden-sign':
      for (const x of [-0.3, 0.3]) part(PALETTE.pole, [0.04, 1, 0.04], [x, 0.5, 0], 'cylinder');
      part(PALETTE.board, [0.8, 0.58, 0.05], [0, 1.02, 0]);
      part(PALETTE.plaque, [0.64, 0.42, 0.012], [0, 1.02, 0.03]);
      for (const [x, color] of [[-0.14, PALETTE.orange], [0.02, PALETTE.tomato], [0.16, PALETTE.leafLight]] as const) part(color, [0.07, 0.07, 0.04], [x, 0.98, 0.045], 'sphere');
      break;
    case 'flower-pot':
      library.place(group, 'pot', [0, 0, 0], 1.6);
      library.place(group, 'bush', [0, 0.3, 0], 0.7);
      library.place(group, 'flower-red', [0.08, 0.34, 0.05], 1.6);
      break;
    case 'log-pile': library.place(group, 'log-stack', [0, 0, 0], 2.1); break;
  }
}

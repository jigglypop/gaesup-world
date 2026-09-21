import { Color, ConeGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, Scene, SphereGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

import type { FurnitureKind } from './types';

/** Shared procedural assets; the scene engine owns their lifetime. */
export function createRoomAssets(scene: Scene) {
  const box = new RoundedBoxGeometry(1, 1, 1, 1, 0.035);
  const sphere = new SphereGeometry(1, 16, 12);
  const cylinder = new CylinderGeometry(1, 1, 1, 24);
  const cone = new ConeGeometry(1, 1, 24);
  const geometries = [box, sphere, cylinder, cone];
  const materials = new Map<string, MeshStandardMaterial>();
  function material(color: string, glow = 0) {
    const key = `${color}:${glow}`;
    let value = materials.get(key);
    if (!value) {
      value = new MeshStandardMaterial({ color, roughness: 0.82, emissive: glow > 0 ? color : '#000000', emissiveIntensity: glow });
      value.name = `${color}${glow ? ` · 발광 ${glow}` : ''}`;
      materials.set(key, value);
    }
    return value;
  }
  function part(
    parent: Group | Scene,
    color: string,
    scale: [number, number, number],
    position: [number, number, number],
    shape: 'box' | 'sphere' | 'cylinder' | 'cone' = 'box',
  ) {
    const mesh = new Mesh(
      shape === 'sphere' ? sphere : shape === 'cylinder' ? cylinder : shape === 'cone' ? cone : box,
      material(color),
    );
    mesh.scale.set(...scale);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  const room = new Group(); room.name = '타운 구조물';
  scene.add(room);
  part(room, '#667f68', [24.2, 0.5, 24.2], [0, -0.31, 0]);
  // Low walls leave the editable terrain visible from every camera preset.
  const back = part(room, '#e5d8bf', [8, 1.6, 0.18], [-7, 0.8, -10]);
  const left = part(room, '#e5d8bf', [0.18, 1.6, 6], [-11, 0.8, -7]);
  const rug = part(room, '#c4a68d', [7, 0.14, 0.18], [6.5, 0.1, -10]);
  for (const x of [-9, -5, 4, 9]) part(room, '#c0a37b', [0.12, 0.8, 0.12], [x, 0.4, -10.1]);
  function furniture(kind: FurnitureKind, glow = 0) {
    const group = new Group(); group.name = kind;
    const lit = (color: string, scale: [number, number, number], position: [number, number, number], shape: 'box' | 'sphere' | 'cylinder' | 'cone' = 'box') => {
      const mesh = part(group, color, scale, position, shape);
      if (glow > 0) mesh.material = material(color, glow);
      return mesh;
    };
    switch (kind) {
      case 'sofa':
        part(group, '#c88672', [2.6, 0.42, 1.1], [0, 0.42, 0]);
        part(group, '#edb198', [2.55, 0.9, 0.28], [0, 0.9, -0.5]);
        part(group, '#f1bca4', [1.07, 0.24, 0.86], [-0.58, 0.72, 0.04]);
        part(group, '#f1bca4', [1.07, 0.24, 0.86], [0.58, 0.72, 0.04]);
        for (const side of [-1, 1])
          part(group, '#dfa086', [0.25, 0.65, 1.18], [side * 1.3, 0.7, 0]);
        part(group, '#fff0d4', [0.55, 0.5, 0.18], [-0.68, 1, -0.22]);
        part(group, '#9dbba7', [0.46, 0.46, 0.18], [0.55, 1, -0.2]);
        break;
      case 'table':
        part(group, '#b48159', [0.67, 0.55, 0.52], [0, 0.32, 0], 'cylinder');
        part(group, '#f0d5ac', [0.91, 0.12, 0.72], [0, 0.64, 0], 'cylinder');
        part(group, '#b8c3a0', [0.46, 0.07, 0.34], [-0.2, 0.75, 0.08]);
        part(group, '#fff5e3', [0.14, 0.24, 0.14], [0.35, 0.82, 0], 'cylinder');
        break;
      case 'plant':
        part(group, '#d69c7e', [0.36, 0.54, 0.36], [0, 0.27, 0], 'cylinder');
        part(group, '#62805c', [0.05, 1.0, 0.05], [0, 0.9, 0], 'cylinder');
        for (let i = 0; i < 5; i += 1) {
          const angle = i * 2.4;
          const leaf = part(
            group,
            i % 2 ? '#7fa47d' : '#91b087',
            [0.24, 0.48, 0.14],
            [Math.cos(angle) * 0.27, 0.95 + i * 0.11, Math.sin(angle) * 0.27],
            'sphere',
          );
          leaf.rotation.z = Math.cos(angle) * 0.8;
          leaf.rotation.x = Math.sin(angle) * 0.8;
        }
        break;
      case 'shelf':
        for (const x of [-0.85, 0.85]) part(group, '#bd9772', [0.12, 1.95, 0.65], [x, 0.975, 0]);
        for (const y of [0.1, 0.72, 1.32, 1.92])
          part(group, '#e1bc8f', [1.82, 0.12, 0.68], [0, y, 0]);
        for (let i = 0; i < 7; i += 1)
          part(
            group,
            ['#8aa8a3', '#deab8c', '#ede0b3'][i % 3] ?? '#8aa8a3',
            [0.15, 0.42 + (i % 2) * 0.08, 0.36],
            [-0.62 + i * 0.18, 0.4, 0],
          );
        part(group, '#f0dcc0', [0.23, 0.4, 0.23], [0.42, 1.55, 0], 'sphere');
        part(group, '#ce957a', [0.6, 0.29, 0.45], [-0.36, 0.93, 0]);
        break;
      case 'lamp':
        part(group, '#b49a79', [0.33, 0.1, 0.33], [0, 0.07, 0], 'cylinder');
        part(group, '#a68c6d', [0.035, 1.85, 0.035], [0, 0.95, 0], 'cylinder');
        lit('#fff0bd', [0.53, 0.75, 0.53], [0, 1.95, 0], 'cone');
        break;
      case 'cushion':
        part(group, '#9bb8a2', [0.6, 0.18, 0.6], [0, 0.2, 0], 'sphere');
        break;
      case 'tree':
        part(group, '#936e4c', [0.2, 1.1, 0.2], [0, 0.55, 0], 'cylinder');
        part(group, '#548a64', [0.9, 1.45, 0.9], [0, 1.65, 0], 'cone');
        part(group, '#78a17a', [0.66, 1.3, 0.66], [0, 2.35, 0], 'cone');
        break;
      case 'bench':
        part(group, '#b28059', [2.2, 0.15, 0.8], [0, 0.55, 0]);
        part(group, '#cfa77d', [2.2, 0.65, 0.12], [0, 0.95, -0.35]);
        for (const x of [-0.8, 0.8]) part(group, '#526a62', [0.13, 0.5, 0.7], [x, 0.25, 0]);
        break;
      case 'desk':
        part(group, '#ebd6b0', [1.8, 0.12, 1], [0, 0.95, 0]);
        for (const x of [-0.7, 0.7]) part(group, '#66767a', [0.1, 0.9, 0.85], [x, 0.45, 0]);
        part(group, '#314b58', [0.9, 0.62, 0.09], [0, 1.38, -0.3]);
        lit('#79d7d3', [0.79, 0.49, 0.02], [0, 1.38, -0.245]);
        part(group, '#677f85', [0.72, 0.04, 0.22], [0, 1.05, 0.12]);
        part(group, '#839b9a', [0.6, 0.12, 0.6], [0, 0.53, 0.96]);
        part(group, '#526a62', [0.15, 0.5, 0.15], [0, 0.25, 0.96], 'cylinder');
        break;
      case 'neon':
        part(group, '#526a62', [0.7, 0.12, 0.7], [0, 0.06, 0]);
        part(group, '#526a62', [0.08, 1.4, 0.08], [0, 0.7, 0]);
        lit('#ff8ecb', [0.13, 1.15, 0.13], [-0.5, 1.8, 0]);
        lit('#ff8ecb', [0.13, 1.15, 0.13], [0.5, 1.8, 0]);
        lit('#ff8ecb', [1.13, 0.13, 0.13], [0, 2.31, 0]);
        lit('#86eff7', [0.23, 0.23, 0.23], [0, 1.85, 0], 'sphere');
        break;
      case 'fountain':
        part(group, '#b6c5bc', [1.1, 0.35, 1.1], [0, 0.2, 0], 'cylinder');
        lit('#6bc5d5', [0.96, 0.03, 0.96], [0, 0.39, 0], 'cylinder');
        part(group, '#dae0cf', [0.2, 0.9, 0.2], [0, 0.75, 0], 'cylinder');
        lit('#b2e8eb', [0.42, 0.12, 0.42], [0, 1.23, 0], 'sphere');
        break;
      case 'arcade':
        part(group, '#536984', [0.9, 1.8, 0.8], [0, 0.9, 0]);
        lit('#7de7cf', [0.68, 0.55, 0.04], [0, 1.25, 0.42]);
        lit('#ffa3c2', [0.8, 0.22, 0.05], [0, 1.7, 0.42]);
        part(group, '#34495b', [0.82, 0.1, 0.4], [0, 0.84, 0.5]);
        part(group, '#e4a865', [0.05, 0.15, 0.05], [-0.2, 0.96, 0.52], 'cylinder');
        break;
    }
    // Ordinary furniture can also be authored as a Bloom object.
    if (glow > 0 && !['lamp', 'neon', 'desk', 'fountain', 'arcade'].includes(kind)) {
      group.traverse(object => { if (object instanceof Mesh && object.material instanceof MeshStandardMaterial) object.material = material(`#${object.material.color.getHexString()}`, glow); });
    }
    return group;
  }
  const avatar = new Group();
  avatar.name = '내 아바타'; avatar.position.set(0, 0, 2);
  scene.add(avatar);
  part(avatar, '#6b493d', [0.34, 0.38, 0.32], [0, 1.27, 0], 'sphere');
  part(avatar, '#f1c7a5', [0.27, 0.3, 0.26], [0, 1.24, 0.13], 'sphere');
  part(avatar, '#67473c', [0.32, 0.16, 0.28], [0, 1.49, 0.15], 'sphere');
  for (const x of [-0.1, 0.1]) {
    part(avatar, '#473e37', [0.025, 0.035, 0.018], [x, 1.25, 0.374], 'sphere');
    part(avatar, '#e6a498', [0.044, 0.022, 0.013], [x * 1.6, 1.17, 0.35], 'sphere');
  }
  part(avatar, '#fff1d3', [0.43, 0.43, 0.33], [0, 0.79, 0]);
  part(avatar, '#c57e64', [0.29, 0.33, 0.24], [0, 0.48, 0], 'cone');
  for (const x of [-0.29, 0.29]) part(avatar, '#fff1d3', [0.13, 0.4, 0.15], [x, 0.8, 0]);
  const feet: Mesh[] = [];
  for (const x of [-0.14, 0.14]) {
    part(avatar, '#f1c7a5', [0.1, 0.21, 0.12], [x, 0.24, 0]);
    feet.push(part(avatar, '#76534a', [0.15, 0.12, 0.23], [x, 0.1, 0.04]));
  }
  material('#a9d6d8').emissive = new Color('#8cc6dc').multiplyScalar(0.16);

  return { room, back, left, rug, avatar, feet, furniture, part, dispose: () => {
    for (const geometry of geometries) geometry.dispose();
    for (const value of materials.values()) value.dispose();
  } };
}

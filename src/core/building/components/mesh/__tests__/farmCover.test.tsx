import ReactThreeTestRenderer from '@react-three/test-renderer';
import type * as THREE from 'three';

import type { FarmPlotConfig, TileConfig } from '../../../types';
import { FarmCover } from '../farm/FarmCover';

const tile = (id: string, x: number, farm: FarmPlotConfig): TileConfig =>
  ({ id, tileGroupId: 'ground', size: 1, position: { x, y: 0, z: 0 }, objectType: 'farm', objectConfig: { farm } });

describe('farm cover', () => {
  it('draws soil, paddy water, wooden edging and instanced crops on the classic renderer', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <FarmCover tiles={[tile('a', 0, { crop: 'rice' }), tile('b', 4, { crop: 'tomato', edge: 'wood' }), tile('c', 8, { soil: 'fallow' })]} />,
    );
    const named = (name: string) => renderer.scene.findAll((node) => (node.instance as unknown as THREE.Object3D).name === name).map((node) => node.instance as unknown as THREE.InstancedMesh);
    for (const name of ['farm-soil', 'farm-water', 'farm-boards', 'farm-weed']) expect(named(name).length).toBeGreaterThan(0);
    const [tomatoes] = named('farm-tomato');
    expect(tomatoes!.count).toBeGreaterThan(10);
    expect(tomatoes!.castShadow).toBe(true);
    expect(named('farm-rice')[0]!.castShadow).toBe(false);
    renderer.unmount();
  });

  it('draws nothing without farm tiles', async () => {
    const renderer = await ReactThreeTestRenderer.create(<FarmCover tiles={[{ ...tile('a', 0, {}), objectType: 'dirt' }]} />);
    expect(renderer.scene.children).toHaveLength(0);
    renderer.unmount();
  });
});

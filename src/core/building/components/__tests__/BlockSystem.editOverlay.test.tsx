import ReactThreeTestRenderer from '@react-three/test-renderer';
import type * as THREE from 'three';

import type { BuildingBlockConfig, MeshConfig } from '../../types';
import { BlockSystem } from '../BlockSystem';

jest.mock('@react-three/rapier', () => ({ useRapier: () => ({ world: {}, rapier: {} }) }));

const blocks: BuildingBlockConfig[] = Array.from({ length: 30 }, (_, index) => ({ id: `block-${index}`, position: { x: index * 2, y: 0, z: 0 } }));

test('block editing draws every block in two meshes and a click on an instance selects that block', async () => {
  const onBlockClick = jest.fn();
  const renderer = await ReactThreeTestRenderer.create(
    <BlockSystem blocks={blocks} meshes={new Map<string, MeshConfig>()} isEditMode selectedBlockId="block-7" colliders={false} onBlockClick={onBlockClick} />,
  );
  try {
    const overlay = renderer.scene.findByProps({ name: 'building-edit-overlay' });
    expect(overlay.children.map((child) => (child.instance as { isInstancedMesh?: boolean }).isInstancedMesh === true)).toEqual([true, false]);
    const instanced = overlay.children[0]!;
    expect((instanced.instance as THREE.InstancedMesh).count).toBe(29);
    await renderer.fireEvent(instanced, 'click', { instanceId: 7 });
    expect(onBlockClick).toHaveBeenCalledWith('block-8');
    await renderer.fireEvent(overlay.children[1]!, 'click');
    expect(onBlockClick).toHaveBeenLastCalledWith('block-7');
  } finally {
    await renderer.unmount();
  }
});

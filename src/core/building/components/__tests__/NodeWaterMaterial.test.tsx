import ReactThreeTestRenderer from '@react-three/test-renderer';

import { createToonWaterMaterial } from '../../../rendering/tsl/toonWater';
import NodeWaterMaterial from '../mesh/water/NodeWaterMaterial';

jest.mock('../../../rendering/tsl/toonWater', () => {
  const { MeshBasicMaterial } = jest.requireActual<typeof import('three')>('three');
  return { createToonWaterMaterial: jest.fn(() => ({ material: new MeshBasicMaterial(), time: { value: 0 } })) };
});
jest.mock('../../../boilerplate/hooks/frameTime', () => ({ getFrameElapsedSeconds: () => 42 }));

test('node water updates the time uniform, reuses its material and disposes on removal', async () => {
  const renderer = await ReactThreeTestRenderer.create(<mesh><NodeWaterMaterial /></mesh>);
  const { material, time } = jest.mocked(createToonWaterMaterial).mock.results[0]!.value as ReturnType<typeof createToonWaterMaterial>;
  const dispose = jest.spyOn(material, 'dispose');
  await renderer.advanceFrames(1, 1 / 60);
  expect(time.value).toBe(42);
  await renderer.update(<mesh position-x={2}><NodeWaterMaterial /></mesh>);
  expect(createToonWaterMaterial).toHaveBeenCalledTimes(1);
  expect(dispose).not.toHaveBeenCalled();
  await renderer.unmount();
  expect(dispose).toHaveBeenCalledTimes(1);
});

import { flushGlobalEffects, useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';

import { FrameSchedulerHost } from '../../runtime/frame';
import { useGaesupStore } from '../../stores/gaesupStore';
import { PerformanceCollector } from '../PerformanceCollector';

// Three's common (WebGPU) Info as its animation loop leaves it: reset before the frame callbacks, counted by the render.
const info = {
  autoReset: true,
  render: { calls: 0, drawCalls: 0, frameCalls: 0, triangles: 0, points: 0, lines: 0 },
  memory: { geometries: 3, textures: 2, programs: 4, total: 1024 },
};

function WebGPUInfo() {
  Object.assign(useThree((state) => state.gl), { info });
  return null;
}

test('WebGPU draw and triangle counts are read after the frame renders, not after the loop reset', async () => {
  const renderer = await ReactThreeTestRenderer.create(
    <>
      <FrameSchedulerHost />
      <WebGPUInfo />
      <PerformanceCollector />
    </>,
  );
  for (let frame = 0; frame < 20; frame++) {
    Object.assign(info.render, { drawCalls: 0, frameCalls: 0, triangles: 0 });
    await renderer.advanceFrames(1, 1 / 60);
    Object.assign(info.render, { drawCalls: 12, frameCalls: 1, triangles: 3400 });
    flushGlobalEffects('after', frame * 16);
  }
  expect(useGaesupStore.getState().performance.render).toMatchObject({
    calls: 12, triangles: 3400, renderInvocations: 1, counterScope: 'renderer-frame',
  });
  await renderer.unmount();
});

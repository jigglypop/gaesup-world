import ReactThreeTestRenderer from '@react-three/test-renderer';

import { FRAME_PHASES, FrameSchedulerHost, useEngineFrame } from '../../runtime/frame';
import { useGaesupStore } from '../../stores/gaesupStore';
import { PerformanceCollector } from '../PerformanceCollector';

const SAMPLE_FRAMES = 30;

function CameraWork() {
  useEngineFrame('camera', () => undefined);
  return null;
}

describe('frame phase timings', () => {
  afterEach(() => {
    useGaesupStore.setState({ framePhases: null });
  });

  test('계측이 켜진 호스트에서 수집기가 단계별 평균 ms를 기록한다', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <>
        <FrameSchedulerHost metrics />
        <CameraWork />
        <PerformanceCollector />
      </>,
    );
    await renderer.advanceFrames(SAMPLE_FRAMES, 1 / 60);

    const timings = useGaesupStore.getState().framePhases;
    expect(timings).not.toBeNull();
    for (const phase of FRAME_PHASES) expect(timings?.[phase]).toBeGreaterThanOrEqual(0);
    await renderer.unmount();
  });

  test('계측이 꺼져 있으면 단계 시간을 기록하지 않는다', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <>
        <FrameSchedulerHost />
        <PerformanceCollector />
      </>,
    );
    await renderer.advanceFrames(SAMPLE_FRAMES, 1 / 60);
    expect(useGaesupStore.getState().framePhases).toBeNull();
    await renderer.unmount();
  });
});

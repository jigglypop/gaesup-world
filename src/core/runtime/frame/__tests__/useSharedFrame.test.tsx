import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';

import { FrameScheduler } from '../FrameScheduler';
import { useCanvasFrameScheduler } from '../react/canvasScheduler';
import { FrameSchedulerHost } from '../react/FrameSchedulerHost';
import type { SharedFrameChannel } from '../react/types';
import { getSharedFrameEntryCount, useSharedFrame } from '../react/useSharedFrame';

const PROBE_CHANNEL: SharedFrameChannel = { phase: 'effects', label: 'test:probe' };
const INSTANCE_COUNT = 100;

function Probe({ onFrame }: { onFrame: (elapsedSeconds: number, hasCamera: boolean) => void }) {
  useSharedFrame(PROBE_CHANNEL, (_, elapsedSeconds, three) => onFrame(elapsedSeconds, Boolean(three.camera)));
  return null;
}

function SchedulerCapture({ onScheduler }: { onScheduler: (scheduler: FrameScheduler) => void }) {
  onScheduler(useCanvasFrameScheduler());
  useThree();
  return null;
}

describe('useSharedFrame', () => {
  test('같은 채널의 인스턴스는 스케줄러 항목 하나로 순회한다', async () => {
    let scheduler: FrameScheduler | null = null;
    const onFrame = jest.fn();
    const renderer = await ReactThreeTestRenderer.create(
      <>
        <FrameSchedulerHost />
        <SchedulerCapture onScheduler={(value) => { scheduler = value; }} />
        {Array.from({ length: INSTANCE_COUNT }, (_, index) => <Probe key={index} onFrame={onFrame} />)}
      </>,
    );
    if (!scheduler) throw new Error('scheduler not captured');
    const captured: FrameScheduler = scheduler;

    expect(captured.count('effects')).toBe(1);
    expect(getSharedFrameEntryCount(captured, PROBE_CHANNEL)).toBe(INSTANCE_COUNT);
    await renderer.advanceFrames(1, 1 / 60);
    expect(onFrame).toHaveBeenCalledTimes(INSTANCE_COUNT);
    expect(onFrame).toHaveBeenLastCalledWith(expect.any(Number), true);

    await renderer.update(<FrameSchedulerHost />);
    expect(getSharedFrameEntryCount(captured, PROBE_CHANNEL)).toBe(0);
    expect(captured.count('effects')).toBe(0);
    await renderer.unmount();
  });

  test('예외가 난 인스턴스만 제외하고 나머지는 계속 실행한다', async () => {
    const healthy = jest.fn();
    const renderer = await ReactThreeTestRenderer.create(
      <>
        <FrameSchedulerHost />
        <Probe onFrame={() => { throw new Error('boom'); }} />
        <Probe onFrame={healthy} />
      </>,
    );
    await renderer.advanceFrames(2, 1 / 60);
    expect(healthy).toHaveBeenCalledTimes(2);
    await renderer.unmount();
  });
});

function InlineChannelProbe({ label }: { label: string }) {
  useSharedFrame({ phase: 'effects', label }, () => undefined);
  return null;
}

test('렌더마다 새 채널 객체를 넘겨도 그룹이 늘거나 재등록되지 않는다', async () => {
  let scheduler: FrameScheduler | null = null;
  const renderer = await ReactThreeTestRenderer.create(
    <>
      <SchedulerCapture onScheduler={(value) => { scheduler = value; }} />
      <InlineChannelProbe label="test:inline" />
    </>,
  );
  if (!scheduler) throw new Error('scheduler not captured');
  const captured: FrameScheduler = scheduler;
  const add = jest.spyOn(captured, 'add');
  await renderer.update(
    <>
      <SchedulerCapture onScheduler={(value) => { scheduler = value; }} />
      <InlineChannelProbe label="test:inline" />
    </>,
  );
  expect(add).not.toHaveBeenCalled();
  expect(getSharedFrameEntryCount(captured, { phase: 'effects', label: 'test:inline' })).toBe(1);
  await renderer.unmount();
  expect(getSharedFrameEntryCount(captured, { phase: 'effects', label: 'test:inline' })).toBe(0);
  expect(captured.count('effects')).toBe(0);
});

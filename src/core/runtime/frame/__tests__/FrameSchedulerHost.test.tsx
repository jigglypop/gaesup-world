import { useFrame } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';

import { frameScheduler } from '../FrameScheduler';
import { FrameSchedulerHost, PHYSICS_STEP_PRIORITY } from '../react/FrameSchedulerHost';
import { useEngineFrame } from '../react/useEngineFrame';
import { useSharedFrame } from '../react/useSharedFrame';
import type { FramePhase } from '../types';

const SHARED_EFFECTS_CHANNEL = { phase: 'effects', label: 'implicit-shared' } as const;

function PhaseProbe({ phase, calls, name }: { phase: FramePhase; calls: string[]; name: string }) {
  useEngineFrame(phase, () => {
    calls.push(name);
  });
  return null;
}

function SharedProbe({ calls, name }: { calls: string[]; name: string }) {
  useSharedFrame(SHARED_EFFECTS_CHANNEL, () => {
    calls.push(name);
  });
  return null;
}

function PhysicsStepProbe({ calls }: { calls: string[] }) {
  useFrame(() => {
    calls.push('physics-step');
  }, PHYSICS_STEP_PRIORITY);
  return null;
}

describe('FrameSchedulerHost', () => {
  afterEach(() => {
    frameScheduler.clear();
  });

  test('물리 step 우선순위를 사이에 두고 물리 전후 단계를 나눠 실행한다', async () => {
    const calls: string[] = [];
    const renderer = await ReactThreeTestRenderer.create(
      <>
        <FrameSchedulerHost />
        <PhaseProbe phase="camera" calls={calls} name="camera" />
        <PhaseProbe phase="postPhysics" calls={calls} name="postPhysics" />
        <PhysicsStepProbe calls={calls} />
        <PhaseProbe phase="input" calls={calls} name="input" />
        <PhaseProbe phase="prePhysics" calls={calls} name="prePhysics" />
      </>,
    );

    await renderer.advanceFrames(1, 1 / 60);
    expect(calls).toEqual(['input', 'prePhysics', 'physics-step', 'postPhysics', 'camera']);
    await renderer.unmount();
  });

  test('캔버스마다 전용 스케줄러를 쓰고 전역 스케줄러는 primary 호스트만 한 번 실행한다', async () => {
    const first: string[] = [];
    const second: string[] = [];
    const globalCalls: string[] = [];
    const unsubscribeGlobal = frameScheduler.add('effects', () => {
      globalCalls.push('global');
    });
    const firstRenderer = await ReactThreeTestRenderer.create(
      <>
        <FrameSchedulerHost />
        <PhaseProbe phase="effects" calls={first} name="first" />
      </>,
    );
    const secondRenderer = await ReactThreeTestRenderer.create(
      <>
        <FrameSchedulerHost />
        <PhaseProbe phase="effects" calls={second} name="second" />
      </>,
    );

    await firstRenderer.advanceFrames(2, 1 / 60);
    await secondRenderer.advanceFrames(2, 1 / 60);
    expect(first).toEqual(['first', 'first']);
    expect(second).toEqual(['second', 'second']);
    expect(globalCalls).toEqual(['global', 'global']);

    await firstRenderer.unmount();
    await secondRenderer.advanceFrames(1, 1 / 60);
    expect(globalCalls).toHaveLength(3);

    unsubscribeGlobal();
    await secondRenderer.unmount();
  });
});

describe('FrameSchedulerHost ownership', () => {
  afterEach(() => {
    frameScheduler.clear();
  });

  test('같은 캔버스에 호스트가 둘이어도 한 번만 틱한다', async () => {
    const calls: string[] = [];
    const renderer = await ReactThreeTestRenderer.create(
      <>
        <FrameSchedulerHost />
        <FrameSchedulerHost />
        <PhaseProbe phase="camera" calls={calls} name="camera" />
      </>,
    );
    await renderer.advanceFrames(2, 1 / 60);
    expect(calls).toEqual(['camera', 'camera']);
    await renderer.unmount();
  });

  test('전역 스케줄러를 캔버스 단계와 단계별로 번갈아 실행한다', async () => {
    const calls: string[] = [];
    const unsubscribeGlobal = frameScheduler.add('lateUpdate', () => {
      calls.push('global-late');
    });
    const renderer = await ReactThreeTestRenderer.create(
      <>
        <FrameSchedulerHost />
        <PhaseProbe phase="postPhysics" calls={calls} name="canvas-post" />
        <PhaseProbe phase="camera" calls={calls} name="canvas-camera" />
      </>,
    );
    await renderer.advanceFrames(1, 1 / 60);
    expect(calls).toEqual(['canvas-post', 'global-late', 'canvas-camera']);
    unsubscribeGlobal();
    await renderer.unmount();
  });
});

describe('implicit frame host', () => {
  afterEach(() => {
    frameScheduler.clear();
  });

  test('호스트가 없는 캔버스도 물리 step 전후 순서대로 단계를 실행한다', async () => {
    const calls: string[] = [];
    const renderer = await ReactThreeTestRenderer.create(
      <>
        <PhaseProbe phase="camera" calls={calls} name="camera" />
        <PhysicsStepProbe calls={calls} />
        <PhaseProbe phase="prePhysics" calls={calls} name="prePhysics" />
      </>,
    );
    await renderer.advanceFrames(1, 1 / 60);
    expect(calls).toEqual(['prePhysics', 'physics-step', 'camera']);
    await renderer.unmount();
  });

  test('공유 프레임도 호스트 없이 구독자마다 한 번씩 실행한다', async () => {
    const calls: string[] = [];
    const renderer = await ReactThreeTestRenderer.create(
      <>
        <SharedProbe calls={calls} name="first" />
        <SharedProbe calls={calls} name="second" />
      </>,
    );
    await renderer.advanceFrames(2, 1 / 60);
    expect(calls).toEqual(['first', 'second', 'first', 'second']);
    await renderer.unmount();
  });
});

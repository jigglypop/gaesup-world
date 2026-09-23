import { AnimatorRuntime } from '../AnimatorRuntime';
import {
  CHARACTER_ANIMATOR_PARAMETERS as P,
  CHARACTER_LOCOMOTION,
  createDefaultCharacterAnimator,
} from '../defaultCharacterAnimator';
import type { AnimatorClipBinding, AnimatorControllerDefinition, AnimatorEvent } from '../types';

type FakeBinding = AnimatorClipBinding & {
  clips: Record<string, number>;
  frames: number;
  disposeCount: number;
  weightOf: (clip: string, layerIndex?: number) => number;
  timeOf: (clip: string, layerIndex?: number) => number | undefined;
  layerWeightOf: (clip: string, layerIndex?: number) => number | undefined;
  writtenClips: () => string[];
};

function createFakeBinding(clips: Record<string, number>): FakeBinding {
  const writes = new Map<string, { time: number; weight: number; layerWeight: number; best: number }>();
  const binding: FakeBinding = {
    clips,
    frames: 0,
    disposeCount: 0,
    hasClip: (_layer, clip) => clip in binding.clips,
    getClipDuration: (_layer, clip) => binding.clips[clip] ?? 0,
    beginFrame: () => {
      binding.frames++;
      writes.clear();
    },
    writeClip: (layer, clip, time, clipWeight, layerWeight) => {
      const key = `${layer}:${clip}`;
      const previous = writes.get(key);
      const useNew = !previous || clipWeight > previous.best;
      writes.set(key, {
        time: useNew ? time : previous.time,
        weight: (previous?.weight ?? 0) + clipWeight,
        layerWeight,
        best: useNew ? clipWeight : previous.best,
      });
    },
    endFrame: () => undefined,
    dispose: () => {
      binding.disposeCount++;
    },
    weightOf: (clip, layerIndex = 0) => writes.get(`${layerIndex}:${clip}`)?.weight ?? 0,
    timeOf: (clip, layerIndex = 0) => writes.get(`${layerIndex}:${clip}`)?.time,
    layerWeightOf: (clip, layerIndex = 0) => writes.get(`${layerIndex}:${clip}`)?.layerWeight,
    writtenClips: () => Array.from(writes.keys()).sort(),
  };
  return binding;
}

function actionController(): AnimatorControllerDefinition {
  return {
    id: 'test.action',
    parameters: {
      attack: { type: 'trigger' },
      guard: { type: 'bool', default: false },
    },
    layers: [
      {
        name: 'base',
        defaultState: 'idle',
        states: [
          { name: 'idle', motion: { kind: 'clip', clip: 'idle' } },
          {
            name: 'attack',
            motion: { kind: 'clip', clip: 'attack', loop: false },
            events: [
              { name: 'swing', time: 0 },
              { name: 'hit', time: 0.5 },
            ],
          },
          { name: 'guard', motion: { kind: 'clip', clip: 'guard' } },
        ],
        transitions: [
          { from: '*', to: 'guard', duration: 0, conditions: [{ parameter: 'guard', operator: 'true' }] },
          { from: 'idle', to: 'attack', duration: 0.2, conditions: [{ parameter: 'attack', operator: 'trigger' }] },
          { from: 'attack', to: 'idle', duration: 0.2, exitTime: 1 },
          { from: 'guard', to: 'idle', duration: 0, conditions: [{ parameter: 'guard', operator: 'false' }] },
        ],
      },
    ],
  };
}

describe('AnimatorRuntime', () => {
  test('생성 즉시 기본 상태를 전체 가중치로 출력한다', () => {
    const binding = createFakeBinding({ idle: 2, attack: 1, guard: 1 });
    const runtime = new AnimatorRuntime(actionController(), binding);
    runtime.update(0.5);
    expect(runtime.getCurrentState()).toBe('idle');
    expect(binding.weightOf('idle')).toBe(1);
    expect(binding.timeOf('idle')).toBeCloseTo(0.5);
    expect(runtime.getDominantClip()).toBe('idle');
  });

  test('트리거는 전이에 사용될 때 소모되고 전이 시간 동안 교차 페이드한다', () => {
    const binding = createFakeBinding({ idle: 2, attack: 1, guard: 1 });
    const runtime = new AnimatorRuntime(actionController(), binding);
    runtime.setTrigger('attack');
    expect(runtime.update(0.1)).toBe(true);
    expect(runtime.getCurrentState()).toBe('attack');
    expect(runtime.getParameter('attack')).toBe(false);
    expect(binding.weightOf('attack')).toBeCloseTo(0.5);
    expect(binding.weightOf('idle')).toBeCloseTo(0.5);
    runtime.update(0.1);
    expect(binding.weightOf('attack')).toBeCloseTo(1);
    expect(binding.weightOf('idle')).toBe(0);
    expect(binding.writtenClips()).toEqual(['0:attack']);
  });

  test('exitTime 전에는 전이하지 않고 한 번 재생 클립은 끝에서 멈춘다', () => {
    const binding = createFakeBinding({ idle: 2, attack: 1, guard: 1 });
    const runtime = new AnimatorRuntime(actionController(), binding);
    runtime.setTrigger('attack');
    runtime.update(0);
    runtime.update(0.6);
    expect(runtime.getCurrentState()).toBe('attack');
    runtime.update(0.3);
    expect(runtime.getCurrentState()).toBe('attack');
    expect(binding.timeOf('attack')).toBeCloseTo(0.9);
    runtime.update(0.15);
    expect(runtime.getCurrentState()).toBe('idle');
    expect(binding.timeOf('attack')).toBeCloseTo(1);
    expect(binding.weightOf('attack')).toBeCloseTo(0.25);
  });

  test('any 상태 전이는 자기 자신으로 다시 들어가지 않고 duration 0이면 즉시 교체한다', () => {
    const binding = createFakeBinding({ idle: 2, attack: 1, guard: 1 });
    const runtime = new AnimatorRuntime(actionController(), binding);
    runtime.setBool('guard', true);
    runtime.update(0.1);
    expect(runtime.getCurrentState()).toBe('guard');
    expect(binding.writtenClips()).toEqual(['0:guard']);
    runtime.update(0.1);
    expect(binding.timeOf('guard')).toBeCloseTo(0.1);
    runtime.setBool('guard', false);
    runtime.update(0.1);
    expect(runtime.getCurrentState()).toBe('idle');
  });

  test('애니메이션 이벤트는 진입 시점과 반복 구간을 넘을 때 한 번씩 발생한다', () => {
    const controller = actionController();
    controller.layers[0]!.states[0]!.events = [{ name: 'step', time: 0.5 }];
    const binding = createFakeBinding({ idle: 1, attack: 1, guard: 1 });
    const runtime = new AnimatorRuntime(controller, binding);
    const events: AnimatorEvent[] = [];
    runtime.onEvent((event) => events.push(event));
    runtime.update(0.4);
    expect(events).toEqual([]);
    runtime.update(0.2);
    runtime.update(0.9);
    expect(events.map((event) => event.name)).toEqual(['step', 'step']);
    expect(events[0]).toEqual({ controllerId: 'test.action', layer: 'base', state: 'idle', name: 'step' });
    runtime.setTrigger('attack');
    events.length = 0;
    runtime.update(0);
    runtime.update(0.6);
    expect(events.map((event) => event.name)).toEqual(['swing', 'hit']);
  });

  test('이벤트 리스너 예외는 다른 리스너와 업데이트를 막지 않는다', () => {
    const controller = actionController();
    controller.layers[0]!.states[0]!.events = [{ name: 'step', time: 0.5 }];
    const runtime = new AnimatorRuntime(controller, createFakeBinding({ idle: 1, attack: 1, guard: 1 }));
    const received: string[] = [];
    runtime.onEvent(() => {
      throw new Error('boom');
    });
    runtime.onEvent((event) => received.push(event.name));
    expect(() => runtime.update(0.6)).not.toThrow();
    expect(received).toEqual(['step']);
  });

  test('클립이 없는 상태로 전이하면 논리 상태만 바뀌고 이전 출력을 유지한다', () => {
    const binding = createFakeBinding({ idle: 2, guard: 1 });
    const runtime = new AnimatorRuntime(actionController(), binding);
    runtime.setTrigger('attack');
    runtime.update(0.1);
    expect(runtime.getCurrentState()).toBe('attack');
    expect(binding.weightOf('idle')).toBe(1);
    expect(runtime.getDominantClip()).toBe('idle');
  });

  test('상태가 아닌 클립을 수동 재생하면 다음 전이가 일어날 때까지 유지한다', () => {
    const binding = createFakeBinding({ idle: 2, attack: 1, guard: 1, dance: 3 });
    const runtime = new AnimatorRuntime(actionController(), binding);
    expect(runtime.play('dance', 0)).toBe(true);
    runtime.update(0.5);
    runtime.update(0.5);
    expect(runtime.getCurrentState()).toBe('idle');
    expect(binding.writtenClips()).toEqual(['0:dance']);
    expect(runtime.getLayerStatus()[0]?.override).toBe('dance');
    runtime.setBool('guard', true);
    runtime.update(0.1);
    expect(binding.writtenClips()).toEqual(['0:guard']);
    expect(runtime.getLayerStatus()[0]?.override).toBeNull();
    expect(runtime.play('missing')).toBe(false);
  });

  test('비활성화하면 아무 클립도 쓰지 않고 다시 켜면 이어서 출력한다', () => {
    const binding = createFakeBinding({ idle: 2, attack: 1, guard: 1 });
    const runtime = new AnimatorRuntime(actionController(), binding);
    runtime.update(0.2);
    runtime.setEnabled(false);
    expect(binding.writtenClips()).toEqual([]);
    expect(runtime.update(1)).toBe(false);
    runtime.setEnabled(true);
    runtime.update(0.2);
    expect(binding.timeOf('idle')).toBeCloseTo(0.4);
  });

  test('전체 속도 배율을 시간 진행과 페이드에 적용한다', () => {
    const binding = createFakeBinding({ idle: 4, attack: 1, guard: 1 });
    const runtime = new AnimatorRuntime(actionController(), binding);
    runtime.setSpeed(2);
    runtime.update(0.5);
    expect(binding.timeOf('idle')).toBeCloseTo(1);
    runtime.setSpeed(-1);
    expect(runtime.getSpeed()).toBe(2);
  });

  test('알 수 없는 파라미터와 형식이 다른 설정은 무시한다', () => {
    const runtime = new AnimatorRuntime(actionController(), createFakeBinding({ idle: 1 }));
    runtime.setFloat('guard', 1);
    runtime.setBool('missing', true);
    runtime.setParameter('guard', 3);
    expect(runtime.getParameter('guard')).toBe(false);
    runtime.setParameter('guard', true);
    expect(runtime.getParameter('guard')).toBe(true);
    expect(runtime.getParameterNames()).toEqual(['attack', 'guard']);
  });

  test('잘못된 정의는 생성 시 오류를 던진다', () => {
    const controller = actionController();
    controller.layers[0]!.defaultState = 'missing';
    expect(() => new AnimatorRuntime(controller, createFakeBinding({}))).toThrow('[AnimatorRuntime Error]');
  });

  test('추가 레이어는 레이어 가중치와 함께 따로 기록된다', () => {
    const controller = actionController();
    controller.layers.push({
      name: 'upper',
      defaultState: 'wave',
      weight: 0.5,
      mask: { bones: ['Spine'], includeDescendants: true },
      states: [{ name: 'wave', motion: { kind: 'clip', clip: 'wave' } }],
    });
    const binding = createFakeBinding({ idle: 1, wave: 1 });
    const runtime = new AnimatorRuntime(controller, binding);
    runtime.update(0.25);
    expect(binding.weightOf('wave', 1)).toBe(1);
    expect(binding.layerWeightOf('wave', 1)).toBe(0.5);
    runtime.setLayerWeight(1, 0);
    runtime.update(0.1);
    expect(binding.weightOf('wave', 1)).toBe(0);
    expect(runtime.getLayerWeight(1)).toBe(0);
    expect(runtime.getLayerStatus().map((layer) => layer.name)).toEqual(['base', 'upper']);
  });

  test('나중에 등록된 클립은 refreshBindings로 기본 상태 출력을 시작한다', () => {
    const binding = createFakeBinding({});
    const runtime = new AnimatorRuntime(actionController(), binding);
    runtime.update(0.1);
    expect(binding.writtenClips()).toEqual([]);
    binding.clips['idle'] = 1;
    runtime.refreshBindings();
    runtime.update(0.1);
    expect(binding.weightOf('idle')).toBe(1);
  });

  test('dispose는 바인딩을 한 번만 정리하고 이후 업데이트를 무시한다', () => {
    const binding = createFakeBinding({ idle: 1 });
    const runtime = new AnimatorRuntime(actionController(), binding);
    runtime.dispose();
    runtime.dispose();
    expect(binding.disposeCount).toBe(1);
    const frames = binding.frames;
    expect(runtime.update(1)).toBe(false);
    expect(binding.frames).toBe(frames);
  });
});

describe('기본 캐릭터 Animator', () => {
  const clips = { idle: 2, walk: 1, run: 0.8, jump: 1, fall: 1, ride: 1 };

  test('locomotion 값으로 idle, walk, run을 선형 블렌딩한다', () => {
    const binding = createFakeBinding(clips);
    const runtime = new AnimatorRuntime(createDefaultCharacterAnimator(), binding);
    runtime.setFloat(P.locomotion, 1.5);
    runtime.update(0.1);
    expect(binding.weightOf('walk')).toBeCloseTo(0.5);
    expect(binding.weightOf('run')).toBeCloseTo(0.5);
    expect(binding.weightOf('idle')).toBe(0);
    runtime.setFloat(P.locomotion, CHARACTER_LOCOMOTION.run);
    runtime.update(0.1);
    expect(binding.weightOf('run')).toBe(1);
    expect(runtime.getDominantClip()).toBe('run');
  });

  test('blend 자식은 정규화 시간을 공유한다', () => {
    const binding = createFakeBinding(clips);
    const runtime = new AnimatorRuntime(createDefaultCharacterAnimator(), binding);
    runtime.setFloat(P.locomotion, 1.5);
    runtime.update(0.45);
    const walkPhase = (binding.timeOf('walk') ?? 0) / clips.walk;
    const runPhase = (binding.timeOf('run') ?? 0) / clips.run;
    expect(walkPhase).toBeCloseTo(runPhase);
    expect(walkPhase).toBeCloseTo(0.5);
  });

  test('ride가 jump보다, jump가 fall보다 우선한다', () => {
    const binding = createFakeBinding(clips);
    const runtime = new AnimatorRuntime(createDefaultCharacterAnimator(), binding);
    runtime.setBool(P.falling, true);
    runtime.setBool(P.jumping, true);
    runtime.setBool(P.riding, true);
    runtime.update(0.1);
    expect(runtime.getCurrentState()).toBe('ride');
    runtime.setBool(P.riding, false);
    runtime.update(0.1);
    expect(runtime.getCurrentState()).toBe('jump');
    runtime.setBool(P.jumping, false);
    runtime.update(0.1);
    expect(runtime.getCurrentState()).toBe('fall');
    runtime.setBool(P.falling, false);
    runtime.update(0.1);
    expect(runtime.getCurrentState()).toBe('locomotion');
  });

  test('jump 클립이 없는 모델은 점프 중에도 이전 이동 출력을 유지한다', () => {
    const binding = createFakeBinding({ idle: 1, walk: 1, run: 1 });
    const runtime = new AnimatorRuntime(createDefaultCharacterAnimator(), binding);
    runtime.setFloat(P.locomotion, CHARACTER_LOCOMOTION.walk);
    runtime.update(0.1);
    runtime.setBool(P.jumping, true);
    runtime.update(0.1);
    expect(runtime.getCurrentState()).toBe('jump');
    expect(binding.weightOf('walk')).toBe(1);
  });
});

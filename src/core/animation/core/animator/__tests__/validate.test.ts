import { defaultCharacterAnimator } from '../defaultCharacterAnimator';
import type { AnimatorControllerDefinition } from '../types';
import { validateAnimatorController } from '../validate';

function baseController(): AnimatorControllerDefinition {
  return {
    id: 'test.controller',
    parameters: {
      speed: { type: 'float', default: 0 },
      grounded: { type: 'bool', default: true },
      attack: { type: 'trigger' },
    },
    layers: [
      {
        name: 'base',
        defaultState: 'idle',
        states: [
          { name: 'idle', motion: { kind: 'clip', clip: 'idle' } },
          { name: 'attack', motion: { kind: 'clip', clip: 'attack', loop: false } },
        ],
        transitions: [
          { from: '*', to: 'attack', conditions: [{ parameter: 'attack', operator: 'trigger' }] },
          { from: 'attack', to: 'idle', exitTime: 1 },
        ],
      },
    ],
  };
}

describe('validateAnimatorController', () => {
  test('기본 캐릭터 컨트롤러는 유효하다', () => {
    expect(validateAnimatorController(defaultCharacterAnimator)).toEqual({ valid: true, issues: [] });
  });

  test('정상 컨트롤러는 이슈가 없다', () => {
    expect(validateAnimatorController(baseController()).valid).toBe(true);
  });

  test('기본 상태와 전이 대상이 없으면 거부한다', () => {
    const controller = baseController();
    const layer = controller.layers[0]!;
    layer.defaultState = 'missing';
    layer.transitions = [{ from: 'idle', to: 'nowhere' }];
    const codes = validateAnimatorController(controller).issues.map((issue) => issue.code);
    expect(codes).toEqual(expect.arrayContaining(['missing-default-state', 'missing-transition-state']));
  });

  test('파라미터 형식과 맞지 않는 조건을 거부한다', () => {
    const controller = baseController();
    controller.layers[0]!.transitions = [
      { from: 'idle', to: 'attack', conditions: [{ parameter: 'grounded', operator: 'greater', value: 1 }] },
      { from: 'idle', to: 'attack', conditions: [{ parameter: 'unknown', operator: 'true' }] },
      { from: 'idle', to: 'attack', conditions: [{ parameter: 'speed', operator: 'greater' }] },
    ];
    const codes = validateAnimatorController(controller).issues.map((issue) => issue.code);
    expect(codes).toEqual(['invalid-condition', 'unknown-parameter', 'invalid-condition']);
  });

  test('blend1D 임계값이 오름차순이 아니거나 파라미터가 float이 아니면 거부한다', () => {
    const controller = baseController();
    controller.layers[0]!.states.push({
      name: 'move',
      motion: {
        kind: 'blend1D',
        parameter: 'grounded',
        children: [
          { clip: 'walk', threshold: 1 },
          { clip: 'run', threshold: 1 },
        ],
      },
    });
    const codes = validateAnimatorController(controller).issues.map((issue) => issue.code);
    expect(codes).toEqual(['unknown-parameter', 'invalid-blend']);
  });

  test('중복 상태, 중복 레이어, 잘못된 이벤트와 가중치를 거부한다', () => {
    const controller = baseController();
    const layer = controller.layers[0]!;
    layer.states.push({ name: 'idle', motion: { kind: 'clip', clip: 'idle2' }, events: [{ name: '', time: 2 }] });
    controller.layers.push({ ...layer, weight: 2, states: [...layer.states] });
    const codes = validateAnimatorController(controller).issues.map((issue) => issue.code);
    expect(codes).toEqual(
      expect.arrayContaining(['duplicate-state', 'duplicate-layer', 'invalid-event', 'invalid-number']),
    );
  });

  test('레이어가 없거나 기본값 형식이 틀리면 거부한다', () => {
    const codes = validateAnimatorController({
      id: '',
      parameters: { speed: { type: 'float', default: true } },
      layers: [],
    }).issues.map((issue) => issue.code);
    expect(codes).toEqual(['empty-controller-id', 'invalid-parameter-default', 'no-layers']);
  });
});

import { createDefaultInputActions, DEFAULT_INPUT_ACTIONS, inputActionsFromProjectSettings } from '../defaults';
import { createInputDeviceState, InputActionMap } from '../InputActionMap';
import { InputRecorder, InputReplay } from '../recorder';

describe('InputActionMap', () => {
  test('키보드 WASD를 정규화된 2D 이동 축으로 평가한다', () => {
    const map = new InputActionMap(createDefaultInputActions());
    const devices = createInputDeviceState();
    devices.keyboard.add('KeyW');
    devices.keyboard.add('KeyD');
    map.evaluate(devices);
    const move = map.get(DEFAULT_INPUT_ACTIONS.move);
    expect(move?.x).toBeCloseTo(Math.SQRT1_2);
    expect(move?.y).toBeCloseTo(Math.SQRT1_2);
    expect(move?.value).toBeCloseTo(1);
  });

  test('버튼은 눌린 프레임과 뗀 프레임을 구분한다', () => {
    const map = new InputActionMap(createDefaultInputActions());
    const devices = createInputDeviceState();
    devices.keyboard.add('Space');
    map.evaluate(devices);
    expect(map.get('jump')).toMatchObject({ pressed: true, down: true, up: false });
    map.evaluate(devices);
    expect(map.get('jump')).toMatchObject({ pressed: true, down: false });
    devices.keyboard.delete('Space');
    map.evaluate(devices);
    expect(map.get('jump')).toMatchObject({ pressed: false, up: true });
  });

  test('게임패드 스틱은 데드존 아래 값을 무시한다', () => {
    const map = new InputActionMap(createDefaultInputActions());
    const devices = createInputDeviceState();
    devices.gamepad.set('axis:0', 0.1);
    map.evaluate(devices);
    expect(map.get('move')?.x).toBe(0);
    devices.gamepad.set('axis:0', 0.8);
    devices.gamepad.set('axis:1', -0.6);
    map.evaluate(devices);
    expect(map.get('move')?.x).toBeCloseTo(0.8);
    expect(map.get('move')?.y).toBeCloseTo(0.6);
  });

  test('project-settings 바인딩을 액션 정의로 바꾼다', () => {
    const definitions = inputActionsFromProjectSettings({
      jump: [{ device: 'keyboard', code: 'Space' }],
      throttle: [
        { device: 'keyboard', code: 'KeyW', scale: 1 },
        { device: 'keyboard', code: 'KeyS', scale: -1 },
      ],
    });
    expect(definitions.map((definition) => [definition.name, definition.kind])).toEqual([
      ['jump', 'button'],
      ['throttle', 'axis1D'],
    ]);
    const map = new InputActionMap(definitions);
    const devices = createInputDeviceState();
    devices.keyboard.add('KeyS');
    map.evaluate(devices);
    expect(map.get('throttle')?.value).toBe(-1);
  });

  test('중복 액션 이름은 거부한다', () => {
    expect(
      () =>
        new InputActionMap([
          { name: 'jump', kind: 'button', bindings: [] },
          { name: 'jump', kind: 'button', bindings: [] },
        ]),
    ).toThrow('[InputActionMap Error]');
  });
});

describe('입력 기록과 재생', () => {
  test('기록한 프레임을 같은 순서로 재생하고 끝나면 초기화한다', () => {
    const map = new InputActionMap(createDefaultInputActions());
    const devices = createInputDeviceState();
    const recorder = new InputRecorder();
    recorder.start();
    devices.keyboard.add('KeyW');
    map.evaluate(devices);
    recorder.capture(map);
    devices.keyboard.clear();
    devices.keyboard.add('Space');
    map.evaluate(devices);
    recorder.capture(map);
    const recording = recorder.stop();
    expect(recording.frames).toHaveLength(2);

    const replayMap = new InputActionMap(createDefaultInputActions());
    const replay = new InputReplay(recording);
    expect(replay.next(replayMap)).toBe(true);
    expect(replayMap.get('move')?.y).toBe(1);
    expect(replay.next(replayMap)).toBe(true);
    expect(replayMap.get('jump')?.down).toBe(true);
    expect(replay.next(replayMap)).toBe(false);
    expect(replayMap.get('jump')?.pressed).toBe(false);
  });
});

import {
  computeThirdPersonCamera,
  DEFAULT_THIRD_PERSON_CAMERA_CONFIG,
  smoothTowards,
} from '../core/camera/thirdPerson';
import {
  createCharacterMotionState,
  DEFAULT_CHARACTER_MOTION_CONFIG,
  stepCharacterMotion,
} from '../core/motion/CharacterMotion';
import { entityIndexOf, NextWorld } from '../core/World';

const DT = 1 / 60;

function createSubject() {
  const world = new NextWorld({ capacity: 4 });
  const index = entityIndexOf(world.createEntity());
  const state = createCharacterMotionState();
  return { world, index, state };
}

describe('CharacterMotion', () => {
  test('입력 방향으로 가속해 위치가 전진한다', () => {
    const { world, index, state } = createSubject();
    for (let frame = 0; frame < 60; frame += 1) {
      stepCharacterMotion(
        world.transforms,
        index,
        state,
        { moveX: 0, moveZ: 1, jump: false, run: false },
        DEFAULT_CHARACTER_MOTION_CONFIG,
        DT,
      );
    }
    const out = new Float32Array(3);
    world.transforms.readPosition(index, out);
    expect(out[2]).toBeGreaterThan(3);
    expect(state.moving).toBe(true);
  });

  test('입력이 없으면 감속해 멈춘다', () => {
    const { world, index, state } = createSubject();
    state.velocity[0] = 6;
    for (let frame = 0; frame < 120; frame += 1) {
      stepCharacterMotion(
        world.transforms,
        index,
        state,
        { moveX: 0, moveZ: 0, jump: false, run: false },
        DEFAULT_CHARACTER_MOTION_CONFIG,
        DT,
      );
    }
    expect(Math.abs(state.velocity[0] ?? 0)).toBeLessThan(0.1);
    expect(state.moving).toBe(false);
  });

  test('점프하면 상승 후 중력으로 지면에 착지한다', () => {
    const { world, index, state } = createSubject();
    stepCharacterMotion(
      world.transforms,
      index,
      state,
      { moveX: 0, moveZ: 0, jump: true, run: false },
      DEFAULT_CHARACTER_MOTION_CONFIG,
      DT,
    );
    expect(state.grounded).toBe(false);
    const out = new Float32Array(3);
    world.transforms.readPosition(index, out);
    expect(out[1]).toBeGreaterThan(0);
    for (let frame = 0; frame < 240; frame += 1) {
      stepCharacterMotion(
        world.transforms,
        index,
        state,
        { moveX: 0, moveZ: 0, jump: false, run: false },
        DEFAULT_CHARACTER_MOTION_CONFIG,
        DT,
      );
    }
    world.transforms.readPosition(index, out);
    expect(out[1]).toBe(0);
    expect(state.grounded).toBe(true);
  });

  test('달리기 입력은 걷기보다 빠르다', () => {
    const walk = createSubject();
    const run = createSubject();
    for (let frame = 0; frame < 60; frame += 1) {
      stepCharacterMotion(
        walk.world.transforms,
        walk.index,
        walk.state,
        { moveX: 1, moveZ: 0, jump: false, run: false },
        DEFAULT_CHARACTER_MOTION_CONFIG,
        DT,
      );
      stepCharacterMotion(
        run.world.transforms,
        run.index,
        run.state,
        { moveX: 1, moveZ: 0, jump: false, run: true },
        DEFAULT_CHARACTER_MOTION_CONFIG,
        DT,
      );
    }
    const walkOut = new Float32Array(3);
    const runOut = new Float32Array(3);
    walk.world.transforms.readPosition(walk.index, walkOut);
    run.world.transforms.readPosition(run.index, runOut);
    expect(runOut[0] ?? 0).toBeGreaterThan(walkOut[0] ?? 0);
  });

  test('yaw는 이동 방향을 향하고 회전 쿼터니언에 반영된다', () => {
    const { world, index, state } = createSubject();
    for (let frame = 0; frame < 30; frame += 1) {
      stepCharacterMotion(
        world.transforms,
        index,
        state,
        { moveX: 1, moveZ: 0, jump: false, run: false },
        DEFAULT_CHARACTER_MOTION_CONFIG,
        DT,
      );
    }
    expect(state.yaw).toBeCloseTo(Math.PI / 2, 1);
    const rotation = new Float32Array(4);
    world.transforms.readRotation(index, rotation);
    expect(rotation[1]).toBeCloseTo(Math.sin(state.yaw / 2), 3);
  });
});

describe('thirdPersonCamera', () => {
  test('yaw 0에서 카메라는 -Z 뒤, look은 타깃 상단을 향한다', () => {
    const eye = new Float32Array(3);
    const look = new Float32Array(3);
    computeThirdPersonCamera(0, 0, 0, 0, DEFAULT_THIRD_PERSON_CAMERA_CONFIG, eye, look);
    expect(eye[0]).toBeCloseTo(0, 5);
    expect(eye[1]).toBeCloseTo(DEFAULT_THIRD_PERSON_CAMERA_CONFIG.height, 5);
    expect(eye[2]).toBeCloseTo(-DEFAULT_THIRD_PERSON_CAMERA_CONFIG.distance, 5);
    expect(look[1]).toBeCloseTo(DEFAULT_THIRD_PERSON_CAMERA_CONFIG.lookHeight, 5);
  });

  test('smoothTowards는 목표로 수렴한다', () => {
    const current = new Float32Array([0, 0, 0]);
    const target = new Float32Array([10, 5, -3]);
    for (let frame = 0; frame < 300; frame += 1) {
      smoothTowards(current, target, 8, DT);
    }
    expect(current[0]).toBeCloseTo(10, 1);
    expect(current[1]).toBeCloseTo(5, 1);
    expect(current[2]).toBeCloseTo(-3, 1);
  });
});

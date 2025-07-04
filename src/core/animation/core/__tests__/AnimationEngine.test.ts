import * as THREE from 'three';

const mockAnimationAction = {
  play: jest.fn().mockReturnThis(),
  stop: jest.fn().mockReturnThis(),
  reset: jest.fn().mockReturnThis(),
  fadeIn: jest.fn().mockReturnThis(),
  fadeOut: jest.fn().mockReturnThis(),
  isRunning: jest.fn(() => false),
  weight: 1,
  timeScale: 1,
};

const mockAnimationMixer = {
  clipAction: jest.fn(() => mockAnimationAction),
  update: jest.fn(),
  stopAllAction: jest.fn(),
};

describe('AnimationEngine', () => {
  let AnimationEngine: any;
  let engine: any;
  let mockObject: THREE.Object3D;

  beforeEach(async () => {
    jest.doMock('three', () => {
      const originalThree = jest.requireActual('three');
      return {
        ...originalThree,
        AnimationMixer: jest.fn(() => mockAnimationMixer),
        AnimationAction: jest.fn(() => mockAnimationAction),
      };
    });

    // Import the class to be tested
    const module = await import('../AnimationEngine');
    AnimationEngine = module.AnimationEngine;

    // Reset mocks
    jest.clearAllMocks();

    // Create a new instance for each test
    engine = new AnimationEngine();
    mockObject = new THREE.Object3D();
    engine.initializeMixer(mockObject);
  });

  afterEach(() => {
    // Reset modules after each test to ensure isolation
    jest.resetModules();
  });

  it('반드시 기본 애니메이션이 있어야 함', () => {
    const state = engine.getState();
    expect(state.currentAnimation).toBe('idle');
    expect(state.isPlaying).toBe(false);
  });

  it('애니메이션 액션을 등록할 수 있어야 함', () => {
    engine.registerAction('testAnim', mockAnimationAction);
    expect(engine.getAnimationList()).toContain('testAnim');
    expect(engine.getState().actions.get('testAnim')).toBe(mockAnimationAction);
  });

  it('애니메이션을 재생할 수 있어야 함', () => {
    engine.registerAction('testAnim', mockAnimationAction);
    engine.playAnimation('testAnim');

    expect(engine.getCurrentAnimation()).toBe('testAnim');
    expect(engine.getState().isPlaying).toBe(true);
    expect(mockAnimationAction.reset).toHaveBeenCalled();
    expect(mockAnimationAction.play).toHaveBeenCalled();
  });

  it('현재 애니메이션을 정지할 수 있어야 함', () => {
    engine.registerAction('testAnim', mockAnimationAction);
    engine.playAnimation('testAnim');
    engine.stopAnimation();

    expect(engine.getCurrentAnimation()).toBe('idle');
    expect(engine.getState().isPlaying).toBe(false);
    expect(mockAnimationAction.stop).toHaveBeenCalled();
  });

  it('상태 변경 시 구독자에게 알림을 보낼 수 있어야 함', () => {
    const callback = jest.fn();
    engine.subscribe(callback);
    engine.registerAction('testAnim', mockAnimationAction);
    expect(callback).toHaveBeenCalledTimes(1);
    engine.playAnimation('testAnim');
    expect(callback).toHaveBeenCalledTimes(2);
  });
}); 
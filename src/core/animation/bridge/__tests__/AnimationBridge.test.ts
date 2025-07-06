import { AnimationCommand, AnimationMetrics } from '../../core/types';
import * as THREE from 'three';
import { AnimationBridge } from '../AnimationBridge';
import { AnimationSystem } from '../../core/AnimationSystem';
import { AnimationSystem as AnimationSystemType } from '../../core/AnimationSystem';

jest.mock('../../core/AnimationSystem');

const MockedAnimationSystem = AnimationSystem as jest.Mock<AnimationSystemType>;

describe('AnimationBridge', () => {
  let bridge: AnimationBridge;
  let mockEngineInstance: jest.Mocked<AnimationSystemType>;

  beforeEach(() => {
    mockEngineInstance = {
      dispose: jest.fn(),
      registerAction: jest.fn(),
      playAnimation: jest.fn(),
      stopAnimation: jest.fn(),
      getState: jest
        .fn()
        .mockReturnValue({ currentAnimation: 'idle', isPlaying: false, currentWeight: 1 }),
      getMetrics: jest.fn().mockReturnValue({ activeAnimations: 0, totalActions: 0 }),
      getAnimationList: jest.fn().mockReturnValue([]),
      subscribe: jest.fn().mockReturnValue(jest.fn()),
    } as unknown as jest.Mocked<AnimationSystemType>;

    MockedAnimationSystem.mockImplementation(() => mockEngineInstance);

    jest.clearAllMocks();
    MockedAnimationSystem.mockClear();
    bridge = new AnimationBridge();
  });

  it('should create an engine for each animation type on construction', () => {
    expect(MockedAnimationSystem).toHaveBeenCalledTimes(3);
  });

  it('should register animations to the correct engine', () => {
    const mockAction = {} as THREE.AnimationAction;
    bridge.registerAnimations('character', { walk: mockAction });
    expect(mockEngineInstance.registerAction).toHaveBeenCalledWith('walk', mockAction);
  });

  it('should execute a "play" command on the correct engine', () => {
    const command: AnimationCommand = { type: 'play', animation: 'drive' };
    bridge.execute('vehicle', command);
    expect(mockEngineInstance.playAnimation).toHaveBeenCalledWith('drive', undefined);
  });

  it('should return a snapshot from an engine', () => {
    const snapshot = bridge.snapshot('character');
    expect(mockEngineInstance.getState).toHaveBeenCalled();
    expect(snapshot.currentAnimation).toBe('idle');
  });

  it('should subscribe and notify listeners', () => {
    const listener = jest.fn();
    bridge.subscribe(listener);

    // Get the callback passed to the engine's subscribe method
    const engineCallback = mockEngineInstance.subscribe.mock.calls[0][0];

    const mockMetrics: AnimationMetrics = {
      activeAnimations: 1,
      totalActions: 1,
      currentWeight: 1,
      mixerTime: 0,
      lastUpdate: 0,
      blendProgress: 1,
    };

    // Simulate an update from the engine
    engineCallback(mockMetrics);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.any(Object), 'character');
  });

  it('should dispose all engines', () => {
    bridge.dispose();
    expect(mockEngineInstance.dispose).toHaveBeenCalledTimes(3);
  });
}); 
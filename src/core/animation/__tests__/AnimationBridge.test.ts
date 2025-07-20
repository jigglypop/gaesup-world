import { AnimationBridge } from '../bridge/AnimationBridge';
import { AnimationSystem } from '../core/AnimationSystem';
import { AnimationType } from '../core/types';
import { AnimationCommand, AnimationSnapshot } from '../bridge/types';
import { BridgeFactory } from '../../boilerplate';

// Mock AnimationSystem
jest.mock('../core/AnimationSystem');

const MockAnimationSystem = AnimationSystem as jest.MockedClass<typeof AnimationSystem>;

describe('AnimationBridge', () => {
  let bridge: AnimationBridge;
  let mockAnimationSystem: jest.Mocked<AnimationSystem>;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    MockAnimationSystem.mockClear();
    
    // Create a mock instance
    mockAnimationSystem = {
      getState: jest.fn(() => ({
        currentAnimation: 'idle',
        isPlaying: false,
        actions: new Map(),
        queue: [],
        settings: {
          crossFadeDuration: 0.3,
          autoQueue: true,
          loop: false,
        },
      })),
      play: jest.fn(),
      stop: jest.fn(),
      pause: jest.fn(),
      crossFadeTo: jest.fn(),
      setTimeScale: jest.fn(),
      registerAction: jest.fn(),
      removeAction: jest.fn(),
      getAnimationList: jest.fn(() => ['idle', 'walk', 'run']),
      dispose: jest.fn(),
    } as unknown as jest.Mocked<AnimationSystem>;

    MockAnimationSystem.mockImplementation(() => mockAnimationSystem);

    bridge = new AnimationBridge();
  });

  afterEach(() => {
    bridge?.dispose();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with all animation types', () => {
      expect(MockAnimationSystem).toHaveBeenCalledTimes(3);
      expect(MockAnimationSystem).toHaveBeenCalledWith('character');
      expect(MockAnimationSystem).toHaveBeenCalledWith('vehicle');
      expect(MockAnimationSystem).toHaveBeenCalledWith('airplane');
    });

    test('should register in BridgeFactory', () => {
      const domains = BridgeFactory.listDomains();
      expect(domains).toContain('animation');
    });
  });

  describe('Engine Management', () => {
    test('should register animation engines correctly', () => {
      expect(bridge.getEngine('character')).toBeDefined();
      expect(bridge.getEngine('vehicle')).toBeDefined();
      expect(bridge.getEngine('airplane')).toBeDefined();
    });

    test('should get snapshot from animation engine', () => {
      const snapshot = bridge.snapshot('character');
      
      expect(mockAnimationSystem.getState).toHaveBeenCalled();
      expect(snapshot).toEqual({
        currentAnimation: 'idle',
        isPlaying: false,
        actions: expect.any(Object),
        queue: [],
        settings: {
          crossFadeDuration: 0.3,
          autoQueue: true,
          loop: false,
        },
      });
    });

    test('should handle snapshot for non-existent engine', () => {
      const snapshot = bridge.snapshot('invalid' as AnimationType);
      expect(snapshot).toBeNull();
    });
  });

  describe('Animation Commands', () => {
    describe('Play Command', () => {
      test('should execute play command', () => {
        const command: AnimationCommand = {
          type: 'play',
          animationName: 'walk',
          options: {
            loop: true,
            timeScale: 1.0,
          },
        };

        bridge.execute('character', command);

        expect(mockAnimationSystem.play).toHaveBeenCalledWith('walk', {
          loop: true,
          timeScale: 1.0,
        });
      });

      test('should handle play command without options', () => {
        const command: AnimationCommand = {
          type: 'play',
          animationName: 'idle',
        };

        bridge.execute('character', command);

        expect(mockAnimationSystem.play).toHaveBeenCalledWith('idle', undefined);
      });
    });

    describe('Stop Command', () => {
      test('should execute stop command', () => {
        const command: AnimationCommand = {
          type: 'stop',
        };

        bridge.execute('character', command);

        expect(mockAnimationSystem.stop).toHaveBeenCalled();
      });

      test('should execute stop command for specific animation', () => {
        const command: AnimationCommand = {
          type: 'stop',
          animationName: 'walk',
        };

        bridge.execute('character', command);

        expect(mockAnimationSystem.stop).toHaveBeenCalledWith('walk');
      });
    });

    describe('Pause Command', () => {
      test('should execute pause command', () => {
        const command: AnimationCommand = {
          type: 'pause',
        };

        bridge.execute('character', command);

        expect(mockAnimationSystem.pause).toHaveBeenCalled();
      });

      test('should execute pause command for specific animation', () => {
        const command: AnimationCommand = {
          type: 'pause',
          animationName: 'run',
        };

        bridge.execute('character', command);

        expect(mockAnimationSystem.pause).toHaveBeenCalledWith('run');
      });
    });

    describe('CrossFade Command', () => {
      test('should execute crossfade command', () => {
        const command: AnimationCommand = {
          type: 'crossfade',
          animationName: 'run',
          duration: 0.5,
          options: {
            loop: false,
          },
        };

        bridge.execute('character', command);

        expect(mockAnimationSystem.crossFadeTo).toHaveBeenCalledWith('run', 0.5, {
          loop: false,
        });
      });

      test('should use default duration for crossfade', () => {
        const command: AnimationCommand = {
          type: 'crossfade',
          animationName: 'jump',
        };

        bridge.execute('character', command);

        expect(mockAnimationSystem.crossFadeTo).toHaveBeenCalledWith('jump', undefined, undefined);
      });
    });

    describe('SetTimeScale Command', () => {
      test('should execute set time scale command', () => {
        const command: AnimationCommand = {
          type: 'setTimeScale',
          timeScale: 2.0,
        };

        bridge.execute('character', command);

        expect(mockAnimationSystem.setTimeScale).toHaveBeenCalledWith(2.0);
      });

      test('should execute set time scale for specific animation', () => {
        const command: AnimationCommand = {
          type: 'setTimeScale',
          animationName: 'walk',
          timeScale: 0.5,
        };

        bridge.execute('character', command);

        expect(mockAnimationSystem.setTimeScale).toHaveBeenCalledWith(0.5, 'walk');
      });
    });

    describe('Register Action Command', () => {
      test('should execute register action command', () => {
        const mockAction = {} as any; // Mock AnimationAction
        
        const command: AnimationCommand = {
          type: 'registerAction',
          animationName: 'custom',
          action: mockAction,
        };

        bridge.execute('character', command);

        expect(mockAnimationSystem.registerAction).toHaveBeenCalledWith('custom', mockAction);
      });
    });

    describe('Remove Action Command', () => {
      test('should execute remove action command', () => {
        const command: AnimationCommand = {
          type: 'removeAction',
          animationName: 'unwanted',
        };

        bridge.execute('character', command);

        expect(mockAnimationSystem.removeAction).toHaveBeenCalledWith('unwanted');
      });
    });

    test('should handle invalid command type', () => {
      const command = {
        type: 'invalid',
      } as any;

      expect(() => bridge.execute('character', command)).not.toThrow();
    });

    test('should handle command execution for invalid engine', () => {
      const command: AnimationCommand = {
        type: 'play',
        animationName: 'test',
      };

      expect(() => bridge.execute('invalid' as AnimationType, command)).not.toThrow();
    });
  });

  describe('Animation State Tracking', () => {
    test('should track multiple engine states', () => {
      mockAnimationSystem.getState.mockReturnValueOnce({
        currentAnimation: 'walk',
        isPlaying: true,
        actions: new Map([['walk', {} as any]]),
        queue: ['run'],
        settings: {
          crossFadeDuration: 0.2,
          autoQueue: false,
          loop: true,
        },
      });

      const characterSnapshot = bridge.snapshot('character');
      const vehicleSnapshot = bridge.snapshot('vehicle');

      expect(characterSnapshot?.currentAnimation).toBe('walk');
      expect(characterSnapshot?.isPlaying).toBe(true);
      expect(vehicleSnapshot?.currentAnimation).toBe('idle');
      expect(vehicleSnapshot?.isPlaying).toBe(false);
    });

    test('should handle state updates through commands', () => {
      // Play animation
      bridge.execute('character', { type: 'play', animationName: 'run' });
      
      // Mock state change
      mockAnimationSystem.getState.mockReturnValue({
        currentAnimation: 'run',
        isPlaying: true,
        actions: new Map(),
        queue: [],
        settings: {
          crossFadeDuration: 0.3,
          autoQueue: true,
          loop: false,
        },
      });

      const snapshot = bridge.snapshot('character');
      expect(snapshot?.currentAnimation).toBe('run');
      expect(snapshot?.isPlaying).toBe(true);
    });
  });

  describe('Cross-Engine Operations', () => {
    test('should execute same command on multiple engines', () => {
      const command: AnimationCommand = {
        type: 'stop',
      };

      bridge.execute('character', command);
      bridge.execute('vehicle', command);
      bridge.execute('airplane', command);

      expect(mockAnimationSystem.stop).toHaveBeenCalledTimes(3);
    });

    test('should maintain independent state per engine', () => {
      // Set different states for different engines
      bridge.execute('character', { type: 'play', animationName: 'walk' });
      bridge.execute('vehicle', { type: 'play', animationName: 'drive' });

      // Each engine should have been called with different animations
      expect(mockAnimationSystem.play).toHaveBeenCalledWith('walk', undefined);
      expect(mockAnimationSystem.play).toHaveBeenCalledWith('drive', undefined);
    });
  });

  describe('Event Handling and Subscriptions', () => {
    test('should handle animation events', () => {
      const eventHandler = jest.fn();
      bridge.on('execute', eventHandler);

      const command: AnimationCommand = {
        type: 'play',
        animationName: 'test',
      };

      bridge.execute('character', command);

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'execute',
          id: 'character',
          data: expect.objectContaining({
            command,
          }),
        })
      );
    });

    test('should remove event listeners', () => {
      const eventHandler = jest.fn();
      
      bridge.on('execute', eventHandler);
      bridge.off('execute', eventHandler);

      bridge.execute('character', { type: 'play', animationName: 'test' });

      expect(eventHandler).not.toHaveBeenCalled();
    });
  });

  describe('Performance and Optimization', () => {
    test('should handle rapid command execution efficiently', () => {
      const commands: AnimationCommand[] = Array.from({ length: 100 }, (_, i) => ({
        type: 'play',
        animationName: `animation_${i}`,
      }));

      const startTime = performance.now();
      
      commands.forEach(command => {
        bridge.execute('character', command);
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(50); // Should handle 100 commands in <50ms
      expect(mockAnimationSystem.play).toHaveBeenCalledTimes(100);
    });

    test('should efficiently manage multiple animation engines', () => {
      const engines: AnimationType[] = ['character', 'vehicle', 'airplane'];
      const startTime = performance.now();

      engines.forEach(engine => {
        for (let i = 0; i < 50; i++) {
          bridge.execute(engine, { type: 'play', animationName: `anim_${i}` });
          bridge.snapshot(engine);
        }
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(100); // Should handle 150 operations in <100ms
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle animation system errors gracefully', () => {
      mockAnimationSystem.play.mockImplementation(() => {
        throw new Error('Animation error');
      });

      const command: AnimationCommand = {
        type: 'play',
        animationName: 'error-animation',
      };

      expect(() => bridge.execute('character', command)).not.toThrow();
    });

    test('should handle invalid animation names', () => {
      const command: AnimationCommand = {
        type: 'play',
        animationName: '',
      };

      expect(() => bridge.execute('character', command)).not.toThrow();
      expect(mockAnimationSystem.play).toHaveBeenCalledWith('', undefined);
    });

    test('should handle null or undefined command properties', () => {
      const command = {
        type: 'play',
        animationName: null,
      } as any;

      expect(() => bridge.execute('character', command)).not.toThrow();
    });

    test('should handle missing required command properties', () => {
      const command = {
        type: 'crossfade',
        // Missing animationName
      } as any;

      expect(() => bridge.execute('character', command)).not.toThrow();
    });
  });

  describe('Middleware Integration', () => {
    test('should work with bridge middleware', () => {
      const middleware = jest.fn((event, next) => {
        // Modify command before execution
        if (event.type === 'execute' && event.data?.command?.type === 'play') {
          event.data.command.options = { ...event.data.command.options, modified: true };
        }
        next();
      });

      bridge.use(middleware);

      const command: AnimationCommand = {
        type: 'play',
        animationName: 'test',
      };

      bridge.execute('character', command);

      expect(middleware).toHaveBeenCalled();
    });

    test('should handle middleware errors gracefully', () => {
      const errorMiddleware = jest.fn(() => {
        throw new Error('Middleware error');
      });

      bridge.use(errorMiddleware);

      const command: AnimationCommand = {
        type: 'play',
        animationName: 'test',
      };

      expect(() => bridge.execute('character', command)).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    test('should dispose all animation engines on bridge disposal', () => {
      bridge.dispose();

      expect(mockAnimationSystem.dispose).toHaveBeenCalledTimes(3);
    });

    test('should clean up event listeners on disposal', () => {
      const eventHandler = jest.fn();
      bridge.on('execute', eventHandler);

      bridge.dispose();

      // Try to trigger event after disposal
      bridge.execute('character', { type: 'play', animationName: 'test' });

      expect(eventHandler).not.toHaveBeenCalled();
    });

    test('should handle multiple disposal calls safely', () => {
      expect(() => {
        bridge.dispose();
        bridge.dispose();
        bridge.dispose();
      }).not.toThrow();
    });
  });

  describe('Integration with BridgeFactory', () => {
    test('should be retrievable from BridgeFactory', () => {
      const retrievedBridge = BridgeFactory.get('animation');
      expect(retrievedBridge).toBeInstanceOf(AnimationBridge);
    });

    test('should be listed in active domains', () => {
      const domains = BridgeFactory.listDomains();
      expect(domains).toContain('animation');
    });
  });

  describe('Animation Queuing and Sequencing', () => {
    test('should handle animation queue commands', () => {
      mockAnimationSystem.getState.mockReturnValue({
        currentAnimation: 'idle',
        isPlaying: false,
        actions: new Map(),
        queue: ['walk', 'run', 'jump'],
        settings: {
          crossFadeDuration: 0.3,
          autoQueue: true,
          loop: false,
        },
      });

      const snapshot = bridge.snapshot('character');
      expect(snapshot?.queue).toEqual(['walk', 'run', 'jump']);
    });

    test('should maintain animation settings through commands', () => {
      const settingsSnapshot = bridge.snapshot('character');
      expect(settingsSnapshot?.settings).toEqual({
        crossFadeDuration: 0.3,
        autoQueue: true,
        loop: false,
      });
    });
  });
}); 
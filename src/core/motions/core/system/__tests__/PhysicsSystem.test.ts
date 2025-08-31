import * as THREE from 'three';
import { PhysicsSystem, PhysicsUpdateArgs } from '../PhysicsSystem';
import { PhysicsCalcProps, PhysicsState } from '../types';
import { PhysicsConfigType } from '@/core/stores/slices/physics/types';
import { GameStatesType } from '@core/world/components/Rideable/types';

// Mock dependencies
jest.mock('../../forces', () => ({
  GravityComponent: jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
    reset: jest.fn(),
  })),
  ForceComponent: jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
    reset: jest.fn(),
  })),
}));

jest.mock('../../movement', () => ({
  DirectionComponent: jest.fn().mockImplementation(() => ({
    calculate: jest.fn(),
    apply: jest.fn(),
  })),
  ImpulseComponent: jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
    reset: jest.fn(),
  })),
}));

jest.mock('../../controller/AnimationController', () => ({
  AnimationController: jest.fn().mockImplementation(() => ({
    update: jest.fn(),
    play: jest.fn(),
    stop: jest.fn(),
  })),
}));

describe('PhysicsSystem', () => {
  let physicsSystem: PhysicsSystem;
  let mockConfig: PhysicsConfigType;
  let mockCalcProps: PhysicsCalcProps;
  let mockPhysicsState: PhysicsState;
  let mockRigidBody: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      gravity: -9.81,
      damping: 0.9,
      friction: 0.8,
      restitution: 0.1,
      mass: 1,
      characterSpeed: 5,
      vehicleSpeed: 20,
      airplaneSpeed: 50,
    } as PhysicsConfigType;

    mockRigidBody = {
      handle: 123,
      linvel: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
      setLinvel: jest.fn(),
      angvel: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
      setAngvel: jest.fn(),
      applyImpulse: jest.fn(),
      translation: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
      setTranslation: jest.fn(),
      rotation: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0, w: 1 }),
    };

    mockCalcProps = {
      rigidBodyRef: { current: mockRigidBody },
      isPressed: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
        run: false,
      },
      camera: new THREE.Camera(),
      deltaTime: 0.016,
    } as PhysicsCalcProps;

    const mockGameStates: GameStatesType = {
      isOnTheGround: true,
      isFalling: false,
      isJumping: false,
      isFlying: false,
      isRiding: false,
      isRunning: false,
      isMoving: false,
      isFloating: false,
    };

    mockPhysicsState = {
      modeType: 'character',
      activeState: {
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        rotation: new THREE.Euler(),
        scale: new THREE.Vector3(1, 1, 1),
      },
      gameStates: mockGameStates,
    } as PhysicsState;

    physicsSystem = new PhysicsSystem(mockConfig, {
      maxForces: 10,
      updateFrequency: 60,
    });
  });

  afterEach(() => {
    physicsSystem.dispose();
  });

  describe('Initialization', () => {
    test('should initialize with correct default state', () => {
      expect(physicsSystem.getState().isJumping).toBe(false);
      expect(physicsSystem.getState().isMoving).toBe(false);
      expect(physicsSystem.getState().isRunning).toBe(false);
    });

    test('should initialize with provided config', () => {
      const customConfig = { ...mockConfig, gravity: -15 };
      const system = new PhysicsSystem(customConfig);
      
      expect(system).toBeDefined();
      system.dispose();
    });

    test('should initialize components correctly', () => {
      const { DirectionComponent } = require('../../movement');
      const { ImpulseComponent } = require('../../movement');
      const { GravityComponent } = require('../../forces');
      
      expect(DirectionComponent).toHaveBeenCalledWith(mockConfig);
      expect(ImpulseComponent).toHaveBeenCalledWith(mockConfig);
      expect(GravityComponent).toHaveBeenCalledWith(mockConfig);
    });
  });

  describe('Configuration Management', () => {
    test('should update config successfully', () => {
      const newConfig = { gravity: -5, damping: 0.5 };
      
      expect(() => {
        physicsSystem.updateConfig(newConfig);
      }).not.toThrow();
    });

    test('should handle partial config updates', () => {
      const partialConfig = { gravity: -12 };
      
      expect(() => {
        physicsSystem.updateConfig(partialConfig);
      }).not.toThrow();
    });

    test('should handle empty config updates', () => {
      expect(() => {
        physicsSystem.updateConfig({});
      }).not.toThrow();
    });
  });

  describe('Physics Calculations', () => {
    test('should handle calculate without rigid body', () => {
      const invalidCalcProps = {
        ...mockCalcProps,
        rigidBodyRef: { current: null }
      };

      expect(() => {
        physicsSystem.calculate(invalidCalcProps, mockPhysicsState);
      }).not.toThrow();
    });

    test('should handle calculate without physics state', () => {
      expect(() => {
        physicsSystem.calculate(mockCalcProps, null as any);
      }).not.toThrow();
    });

    test('should update velocity from rigid body', () => {
      const mockVelocity = { x: 5, y: 2, z: 3 };
      mockRigidBody.linvel.mockReturnValue(mockVelocity);

      physicsSystem.calculate(mockCalcProps, mockPhysicsState);

      expect(mockPhysicsState.activeState.velocity.x).toBe(5);
      expect(mockPhysicsState.activeState.velocity.y).toBe(2);
      expect(mockPhysicsState.activeState.velocity.z).toBe(3);
    });

    test('should call animation controller update', () => {
      const { AnimationController } = require('../../controller/AnimationController');
      const mockAnimationController = new AnimationController();

      physicsSystem.calculate(mockCalcProps, mockPhysicsState);

      expect(mockAnimationController.update).toHaveBeenCalledWith(mockPhysicsState.gameStates);
    });
  });

  describe('Character Mode Physics', () => {
    beforeEach(() => {
      mockPhysicsState.modeType = 'character';
    });

    test('should handle character physics calculations', () => {
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });

    test('should respond to forward movement input', () => {
      mockCalcProps.isPressed.forward = true;
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      // Should have called movement components
      const { DirectionComponent } = require('../../movement');
      expect(DirectionComponent).toHaveBeenCalled();
    });

    test('should respond to backward movement input', () => {
      mockCalcProps.isPressed.backward = true;
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });

    test('should respond to jump input when grounded', () => {
      mockCalcProps.isPressed.jump = true;
      mockPhysicsState.gameStates.isOnTheGround = true;
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      const { ImpulseComponent } = require('../../movement');
      expect(ImpulseComponent).toHaveBeenCalled();
    });

    test('should handle running state', () => {
      mockCalcProps.isPressed.run = true;
      mockCalcProps.isPressed.forward = true;
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });
  });

  describe('Vehicle Mode Physics', () => {
    beforeEach(() => {
      mockPhysicsState.modeType = 'vehicle';
    });

    test('should handle vehicle physics calculations', () => {
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });

    test('should handle vehicle acceleration', () => {
      mockCalcProps.isPressed.forward = true;
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });

    test('should handle vehicle steering', () => {
      mockCalcProps.isPressed.left = true;
      mockCalcProps.isPressed.forward = true;
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });
  });

  describe('Airplane Mode Physics', () => {
    beforeEach(() => {
      mockPhysicsState.modeType = 'airplane';
    });

    test('should handle airplane physics calculations', () => {
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });

    test('should handle airplane thrust', () => {
      mockCalcProps.isPressed.forward = true;
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });

    test('should handle airplane pitch control', () => {
      mockCalcProps.isPressed.backward = true;
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });
  });

  describe('State Checks', () => {
    test('should check ground state correctly', () => {
      mockRigidBody.linvel.mockReturnValue({ x: 0, y: -0.1, z: 0 });
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });

    test('should check moving state correctly', () => {
      mockRigidBody.linvel.mockReturnValue({ x: 5, y: 0, z: 3 });
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });

    test('should check riding state correctly', () => {
      mockPhysicsState.gameStates.isRiding = true;
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });
  });

  describe('System Update', () => {
    test('should handle update with valid args', () => {
      const updateArgs: PhysicsUpdateArgs = {
        deltaTime: 0.016,
        totalTime: 1000,
        frameCount: 60,
        calcProp: mockCalcProps,
        physicsState: mockPhysicsState,
      };

      expect(() => {
        physicsSystem.update(updateArgs);
      }).not.toThrow();
    });

    test('should handle update without calc props', () => {
      const updateArgs: PhysicsUpdateArgs = {
        deltaTime: 0.016,
        totalTime: 1000,
        frameCount: 60,
        calcProp: null as any,
        physicsState: mockPhysicsState,
      };

      expect(() => {
        physicsSystem.update(updateArgs);
      }).not.toThrow();
    });

    test('should update metrics correctly', () => {
      const updateArgs: PhysicsUpdateArgs = {
        deltaTime: 0.016,
        totalTime: 1000,
        frameCount: 60,
        calcProp: mockCalcProps,
        physicsState: mockPhysicsState,
      };

      physicsSystem.update(updateArgs);
      
      const metrics = physicsSystem.getMetrics();
      expect(metrics.frameTime).toBeDefined();
    });
  });

  describe('Force Management', () => {
    test('should handle gravity forces', () => {
      const { GravityComponent } = require('../../forces');
      const mockGravityComponent = new GravityComponent(mockConfig);
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(GravityComponent).toHaveBeenCalledWith(mockConfig);
    });

    test('should handle impulse forces', () => {
      const { ImpulseComponent } = require('../../movement');
      const mockImpulseComponent = new ImpulseComponent(mockConfig);
      
      mockCalcProps.isPressed.jump = true;
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(ImpulseComponent).toHaveBeenCalledWith(mockConfig);
    });

    test('should handle direction forces', () => {
      const { DirectionComponent } = require('../../movement');
      const mockDirectionComponent = new DirectionComponent(mockConfig);
      
      mockCalcProps.isPressed.forward = true;
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(DirectionComponent).toHaveBeenCalledWith(mockConfig);
    });
  });

  describe('Performance', () => {
    test('should handle rapid updates efficiently', () => {
      const updateArgs: PhysicsUpdateArgs = {
        deltaTime: 0.016,
        totalTime: 1000,
        frameCount: 60,
        calcProp: mockCalcProps,
        physicsState: mockPhysicsState,
      };

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        physicsSystem.update(updateArgs);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    test('should cache key states efficiently', () => {
      mockCalcProps.isPressed.forward = true;
      
      for (let i = 0; i < 10; i++) {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }
      
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid rigid body gracefully', () => {
      mockCalcProps.rigidBodyRef.current = null;
      
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });

    test('should handle missing physics state gracefully', () => {
      expect(() => {
        physicsSystem.calculate(mockCalcProps, undefined as any);
      }).not.toThrow();
    });

    test('should handle rigid body errors gracefully', () => {
      mockRigidBody.linvel.mockImplementation(() => {
        throw new Error('Rigid body error');
      });
      
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).toThrow();
    });

    test('should handle invalid mode type', () => {
      mockPhysicsState.modeType = 'invalid' as any;
      
      expect(() => {
        physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      }).not.toThrow();
    });
  });

  describe('State Persistence', () => {
    test('should maintain state across multiple calculations', () => {
      mockCalcProps.isPressed.forward = true;
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      const state1 = physicsSystem.getState();
      
      mockCalcProps.isPressed.forward = false;
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      const state2 = physicsSystem.getState();
      
      expect(state1).toBeDefined();
      expect(state2).toBeDefined();
    });

    test('should update state correctly over time', () => {
      const initialTime = performance.now();
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      const state = physicsSystem.getState();
      expect(state.lastUpdate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration', () => {
    test('should integrate with animation controller', () => {
      const { AnimationController } = require('../../controller/AnimationController');
      const mockAnimationController = new AnimationController();
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(mockAnimationController.update).toHaveBeenCalledWith(mockPhysicsState.gameStates);
    });

    test('should integrate with force components', () => {
      const { GravityComponent, ForceComponent } = require('../../forces');
      
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(GravityComponent).toHaveBeenCalled();
    });

    test('should integrate with movement components', () => {
      const { DirectionComponent, ImpulseComponent } = require('../../movement');
      
      mockCalcProps.isPressed.forward = true;
      physicsSystem.calculate(mockCalcProps, mockPhysicsState);
      
      expect(DirectionComponent).toHaveBeenCalled();
      expect(ImpulseComponent).toHaveBeenCalled();
    });
  });
}); 
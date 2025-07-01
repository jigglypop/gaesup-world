import { useCallback, useEffect, useRef } from 'react';
import { useFrame, RootState } from '@react-three/fiber';
import { usePhysics } from './hooks/usePhysics';
import { PhysicsState, PhysicsCalculationProps } from './types';
import { PhysicsEngine } from './core/Engine';
import { SizesType } from '../stores/slices/sizes';
import { PhysicsCalcProps } from './core/types';
import { StoreState } from '../stores/types';
import { PhysicsMemoryPool } from './core/PhysicsMemoryPool';
import * as THREE from 'three';

export * from './core';
export * from './bridge';
export * from './components';
export * from './hooks';


const KEYBOARD_KEY_INDICES = {
  forward: 0,
  backward: 1,
  leftward: 2,
  rightward: 3,
  shift: 4,
  space: 5,
  keyE: 6,
  keyR: 7,
} as const;

const updateInputState = (state: PhysicsState, input: PhysicsCalculationProps): void => {
  const keyboardKeys: (keyof typeof state.keyboard)[] = [
    'forward',
    'backward',
    'leftward',
    'rightward',
    'shift',
    'space',
    'keyE',
    'keyR',
  ];
  
  for (let i = 0; i < keyboardKeys.length; i++) {
    const key = keyboardKeys[i];
    if (state.keyboard[key] !== input.keyboard[key]) {
      state.keyboard[key] = input.keyboard[key];
    }
  }

  if (!state.mouse.target.equals(input.mouse.target)) {
    state.mouse.target.copy(input.mouse.target);
  }

  if (state.mouse.angle !== input.mouse.angle) {
    state.mouse.angle = input.mouse.angle;
  }
  if (state.mouse.isActive !== input.mouse.isActive) {
    state.mouse.isActive = input.mouse.isActive;
  }
  if (state.mouse.shouldRun !== input.mouse.shouldRun) {
    state.mouse.shouldRun = input.mouse.shouldRun;
  }
};

const usePhysicsLoop = (props: PhysicsCalculationProps) => {
  const physics = usePhysics();
  const physicsStateRef = useRef<PhysicsState | null>(null);
  const physicsEngine = useRef(new PhysicsEngine());
  const isInitializedRef = useRef(false);
  const memoryPool = useRef(PhysicsMemoryPool.getInstance());
  const mouseTargetRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!isInitializedRef.current && physics.worldContext) {
      isInitializedRef.current = true;
    }
  }, [physics.worldContext]);

  useEffect(() => {
    const handleTeleport = (event: CustomEvent) => {
      try {
        const { position } = event.detail;
        if (props.rigidBodyRef.current && position) {
          props.rigidBodyRef.current.setTranslation(
            {
              x: position.x,
              y: position.y,
              z: position.z,
            },
            true,
          );
          props.rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
          props.rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
      } catch (error) {
        console.error('Teleport error:', error);
      }
    };

    window.addEventListener('gaesup:teleport', handleTeleport as EventListener);
    document.addEventListener('teleport-request', handleTeleport as EventListener);

    return () => {
      window.removeEventListener('gaesup:teleport', handleTeleport as EventListener);
      document.removeEventListener('teleport-request', handleTeleport as EventListener);
    };
  }, [props.rigidBodyRef]);

  const executePhysics = useCallback(
    (state: RootState, delta: number) => {
      try {
        if (!physics.worldContext || !physics.input) return;
        
        if (!physicsStateRef.current) {
          const worldContext = physics.worldContext as StoreState;
          const modeType = worldContext.mode?.type || 'character';
          physicsStateRef.current = {
            activeState: physics.activeState!,
            gameStates: worldContext.states!,
            keyboard: { ...physics.input.keyboard },
            mouse: {
              target: mouseTargetRef.current.copy(physics.input.mouse.target),
              angle: physics.input.mouse.angle,
              isActive: physics.input.mouse.isActive,
              shouldRun: physics.input.mouse.shouldRun,
            },
            characterConfig: worldContext.character || {},
            vehicleConfig: worldContext.vehicle || {},
            airplaneConfig: worldContext.airplane || {},
            automationOption: worldContext.automation || {
              isActive: false,
              queue: {
                actions: [],
                currentIndex: 0,
                isRunning: false,
                isPaused: false,
                loop: false,
                maxRetries: 3
              },
              settings: {
                trackProgress: false,
                autoStart: false,
                loop: false,
                showVisualCues: false
              }
            },
            modeType: modeType as 'character' | 'vehicle' | 'airplane',
          };
          
          if (props.rigidBodyRef?.current && physics.activeState) {
            props.rigidBodyRef.current.lockRotations(false, true);
            physics.activeState.euler.set(0, 0, 0);
            props.rigidBodyRef.current.setTranslation(
              {
                x: physics.activeState.position.x,
                y: physics.activeState.position.y + 5,
                z: physics.activeState.position.z,
              },
              true,
            );
          }
        } else {
          updateInputState(physicsStateRef.current, physics.input);
          if (physicsStateRef.current) {
            const worldContext = physics.worldContext as StoreState;
            physicsStateRef.current.gameStates = worldContext.states!;
          }
        }

        const calcProp: PhysicsCalcProps = {
          ...props,
          state,
          delta,
          worldContext: physics.worldContext,
          dispatch: physics.dispatch,
          matchSizes: physics.getSizesByUrls() as SizesType,
          inputRef: { current: physics.input },
          setKeyboardInput: physics.setKeyboardInput,
          setMouseInput: physics.setMouseInput,
        };

        physicsEngine.current.calculate(calcProp, physicsStateRef.current);
      } catch (error) {
        console.error('Physics execution error:', error);
      }
    },
    [physics, props],
  );

  useFrame((state, delta) => {
    if (!physics.isReady || !isInitializedRef.current) return;
    
    if (physics.blockControl) {
      props.rigidBodyRef?.current?.resetForces(false);
      props.rigidBodyRef?.current?.resetTorques(false);
      return;
    }
    
    executePhysics(state, delta);
  });
};

export default usePhysicsLoop;

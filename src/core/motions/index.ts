import { useCallback, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhysics } from './core/physics';
import { PhysicsState, PhysicsCalculationProps } from './types';
import { PhysicsEngine } from './core/Engine';
import { SizesType } from '../stores/slices/sizes';
import { PhysicsCalcProps } from './core/types';

export * from './core';
export * from './bridge';
export * from './components';


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
  
  let hasKeyboardChange = false;
  keyboardKeys.forEach((key) => {
    if (state.keyboard[key] !== input.keyboard[key]) {
      state.keyboard[key] = input.keyboard[key];
      hasKeyboardChange = true;
    }
  });

  if (!state.mouse.target.equals(input.mouse.target)) {
    state.mouse.target.copy(input.mouse.target);
  }

  const mouseKeys: Exclude<keyof typeof state.mouse, 'target'>[] = [
    'angle',
    'isActive',
    'shouldRun',
  ];
  
  let hasMouseChange = false;
  mouseKeys.forEach((prop) => {
    if (state.mouse[prop] !== input.mouse[prop]) {
      state.mouse[prop] = input.mouse[prop];
      hasMouseChange = true;
    }
  });
};

const usePhysicsLoop = (props: PhysicsCalculationProps) => {
  const physics = usePhysics();
  const physicsStateRef = useRef<PhysicsState | null>(null);
  const physicsEngine = useRef(new PhysicsEngine());
  const isInitializedRef = useRef(false);

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
    (state: any, delta: number) => {
      try {
        if (!physics.worldContext || !physics.input) return;
        
        if (!physicsStateRef.current) {
          const modeType = (physics.worldContext as any)?.mode?.type || 'character';
          physicsStateRef.current = {
            activeState: physics.activeState!,
            gameStates: (physics.worldContext as any).states!,
            keyboard: { ...physics.input.keyboard },
            mouse: {
              target: physics.input.mouse.target.clone(),
              angle: physics.input.mouse.angle,
              isActive: physics.input.mouse.isActive,
              shouldRun: physics.input.mouse.shouldRun,
            },
            characterConfig: (physics.worldContext as any).character || {},
            vehicleConfig: (physics.worldContext as any).vehicle || {},
            airplaneConfig: (physics.worldContext as any).airplane || {},
            automation: (physics.worldContext as any).automation || {},
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
            physicsStateRef.current.gameStates = (physics.worldContext as any).states!;
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

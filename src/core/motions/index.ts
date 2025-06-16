import { useCallback, useEffect, useRef } from 'react';
import { usePhysics } from './core/physics';
import { useUnifiedFrame } from '../hooks/useUnifiedFrame';
import { PhysicsCalcProps, PhysicsCalculationProps, PhysicsState } from './types';
import { PhysicsEngine } from './core/Engine';
import { SizesType } from '../stores/slices/sizes';
export { GaesupWorld } from '../component/GaesupWorld';
export { GaesupController } from '../component/GaesupController';

const updateInputState = (state: PhysicsState, input: PhysicsCalculationProps) => {
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
  keyboardKeys.forEach((key) => {
    if (state.keyboard[key] !== input.keyboard[key]) {
      state.keyboard[key] = input.keyboard[key];
    }
  });
  if (!state.mouse.target.equals(input.mouse.target)) state.mouse.target.copy(input.mouse.target);

  const mouseKeys: Exclude<keyof typeof state.mouse, 'target'>[] = [
    'angle',
    'isActive',
    'shouldRun',
  ];
  mouseKeys.forEach((prop) => {
    if (state.mouse[prop] !== input.mouse[prop]) {
      (state.mouse as any)[prop] = input.mouse[prop];
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

  const executePhysics = useCallback(
    (state: any, delta: number) => {
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
          clickerOption: (physics.worldContext as any).clickerOption || {},
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
    },
    [physics, props],
  );

  useUnifiedFrame(
    `physics-${props.rigidBodyRef?.current?.handle || 'unknown'}`,
    (state, delta) => {
      if (!physics.isReady || !isInitializedRef.current) return;

      if (physics.blockControl) {
        props.rigidBodyRef?.current?.resetForces(false);
        props.rigidBodyRef?.current?.resetTorques(false);
        return;
      }
      executePhysics(state, delta);
    },
    0,
    true,
  );
};

export default usePhysicsLoop;

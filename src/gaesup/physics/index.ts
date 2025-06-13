import { useCallback, useEffect, useRef } from 'react';
import { type SizesType } from '../../types';
import { usePhysics } from './stores/physics';
import { useUnifiedFrame } from '../hooks/useUnifiedFrame';
import { PhysicsCalcProps, PhysicsCalculationProps, PhysicsState } from './types';
import { physicsSync } from './stores';
import { PhysicsEngine } from './PhysicsEngine';
export { GaesupWorld, GaesupController } from '../component/physics';

const defaultClickerOption = {
  isRun: true,
  throttle: 100,
  autoStart: false,
  track: false,
  loop: false,
  queue: [],
  line: false,
};

const updateKeyboardState = (state: any, input: any) => {
  const keys = ['forward', 'backward', 'leftward', 'rightward', 'shift', 'space', 'keyE', 'keyR'];
  keys.forEach((key) => {
    if (state.keyboard[key] !== input.keyboard[key]) {
      state.keyboard[key] = input.keyboard[key];
    }
  });
};

const updateMouseState = (state: any, input: any) => {
  if (!state.mouse.target.equals(input.mouse.target)) state.mouse.target.copy(input.mouse.target);
  ['angle', 'isActive', 'shouldRun'].forEach((prop) => {
    if (state.mouse[prop] !== input.mouse[prop]) state.mouse[prop] = input.mouse[prop];
  });
};

export default function calculation(props: PhysicsCalculationProps) {
  const physics = usePhysics();
  const physicsStateRef = useRef<PhysicsState | null>(null);
  const isInitializedRef = useRef(false);
  const physicsEngine = useRef(new PhysicsEngine());
  const lastModeType = useRef('');

  useEffect(() => {
    if (isInitializedRef.current || !physics.worldContext) return;
    physicsSync.setWorldContext(physics.worldContext as any);
    physicsSync.initialize(
      () => {},
      () => {},
    );
    isInitializedRef.current = true;
  }, [physics.worldContext]);

  useEffect(() => {
    if (!props.rigidBodyRef?.current || !props.innerGroupRef?.current || !isInitializedRef.current)
      return;
    const activeState = physics.activeState;
    if (activeState) {
      props.rigidBodyRef.current.lockRotations(false, true);
      activeState.euler.set(0, 0, 0);
      props.rigidBodyRef.current.setTranslation(
        { x: activeState.position.x, y: activeState.position.y + 5, z: activeState.position.z },
        true,
      );
    }
  }, [
    props.rigidBodyRef?.current,
    props.innerGroupRef?.current,
    isInitializedRef.current,
    physics.activeState,
  ]);

  const createOrUpdatePhysicsState = useCallback(() => {
    if (!physics.worldContext || !physics.input) return null;

    const modeType = (physics.worldContext as any)?.mode?.type || 'character';

    if (!physicsStateRef.current) {
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
        clickerOption: (physics.worldContext as any).clickerOption || defaultClickerOption,
        modeType: modeType as 'character' | 'vehicle' | 'airplane',
      };
    } else {
      updateKeyboardState(physicsStateRef.current, physics.input);
      updateMouseState(physicsStateRef.current, physics.input);

      if (physicsStateRef.current.activeState !== physics.activeState) {
        physicsStateRef.current.activeState = physics.activeState!;
      }
      if (physicsStateRef.current.gameStates !== (physics.worldContext as any).states) {
        physicsStateRef.current.gameStates = (physics.worldContext as any).states;
      }

      if (lastModeType.current !== modeType) {
        physicsSync.updateMode((physics.worldContext as any)?.mode);
        lastModeType.current = modeType;
      }
    }

    return physicsStateRef.current;
  }, [physics]);

  const executePhysics = useCallback(
    (state: any, delta: number) => {
      const physicsState = createOrUpdatePhysicsState();
      if (!physicsState?.activeState || !physicsState?.gameStates) return;

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

      physicsEngine.current.calculate(calcProp, physicsState);
    },
    [props, physics, createOrUpdatePhysicsState],
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
}

import { useCallback, useEffect, useRef } from 'react';
import { type SizesType } from '../../types';
import { usePhysics } from './stores';
import { useUnifiedFrame } from '../hooks/useUnifiedFrame';
import airplaneCalculation from './airplane';
import { direction } from './character/direction';
import { gravity } from './character/gravity';
import { impulse } from './character/impulse';
import { innerCalc } from './character/innerCalc';
import check from './check';
import { PhysicsCalcProps, PhysicsCalculationProps, PhysicsState } from './types';
import vehicleCalculation from './vehicle';
import { physicsSync } from './stores';

export { GaesupController } from './controller';
export { GaesupWorld } from './world';

export default function calculation(props: PhysicsCalculationProps) {
  const { bridgeRef, layerStatus } = usePhysics();
  const physicsStateRef = useRef<PhysicsState | null>(null);
  const isReadyRef = useRef(false);
  const matchSizesRef = useRef<SizesType | null>(null);
  const isInitializedRef = useRef(false);
  const calcPropRef = useRef<PhysicsCalcProps | null>(null);
  const calculationFnRef = useRef<((calcProp: PhysicsCalcProps) => void) | null>(null);
  const cacheRef = useRef({
    modeType: '',
    modeControl: '',
    calculationFn: null as ((calcProp: PhysicsCalcProps) => void) | null,
    lastUpdateTime: 0,
    frameSkipCount: 0,
    lastWorldContext: null as unknown,
    lastInput: null as unknown,
    lastUrls: null as unknown,
    skipFrameCount: 0,
  });

  useEffect(() => {
    return () => {
      physicsStateRef.current = null;
      isReadyRef.current = false;
      matchSizesRef.current = null;
      isInitializedRef.current = false;
      calcPropRef.current = null;
      calculationFnRef.current = null;
      cacheRef.current = {
        modeType: '',
        modeControl: '',
        calculationFn: null,
        lastUpdateTime: 0,
        frameSkipCount: 0,
        lastWorldContext: null,
        lastInput: null,
        lastUrls: null,
        skipFrameCount: 0,
      };
    };
  }, []);

  useEffect(() => {
    if (!isInitializedRef.current && bridgeRef.current?.worldContext) {
      physicsSync.setWorldContext(bridgeRef.current.worldContext as any);
      physicsSync.initialize(
        () => {},
        () => {},
      );
      isInitializedRef.current = true;
    }
  }, [bridgeRef.current?.worldContext]);

  useEffect(() => {
    if (!props.rigidBodyRef?.current || !props.innerGroupRef?.current || !isInitializedRef.current)
      return;
    const activeState = bridgeRef.current?.activeState;
    if (activeState) {
      props.rigidBodyRef.current.lockRotations(false, true);
      activeState.euler.set(0, 0, 0);
      props.rigidBodyRef.current.setTranslation(
        { x: activeState.position.x, y: activeState.position.y + 5, z: activeState.position.z },
        true,
      );
    }
  }, [props.rigidBodyRef?.current, props.innerGroupRef?.current, isInitializedRef.current]);

  const updatePhysicsStateOnly = useCallback(
    (state: PhysicsState, worldContext: any, input: any): void => {
      const kb = state.keyboard;
      const inputKb = input.keyboard;
      if (kb.forward !== inputKb.forward) kb.forward = inputKb.forward;
      if (kb.backward !== inputKb.backward) kb.backward = inputKb.backward;
      if (kb.leftward !== inputKb.leftward) kb.leftward = inputKb.leftward;
      if (kb.rightward !== inputKb.rightward) kb.rightward = inputKb.rightward;
      if (kb.shift !== inputKb.shift) kb.shift = inputKb.shift;
      if (kb.space !== inputKb.space) kb.space = inputKb.space;
      if (kb.keyR !== inputKb.keyR) kb.keyR = inputKb.keyR;
      if (!state.mouse.target.equals(input.mouse.target)) {
        state.mouse.target.copy(input.mouse.target);
      }
      if (state.mouse.angle !== input.mouse.angle) state.mouse.angle = input.mouse.angle;
      if (state.mouse.isActive !== input.mouse.isActive)
        state.mouse.isActive = input.mouse.isActive;
      if (state.mouse.shouldRun !== input.mouse.shouldRun)
        state.mouse.shouldRun = input.mouse.shouldRun;

      if (state.activeState !== worldContext.activeState) {
        state.activeState = worldContext.activeState;
      }
      if (state.gameStates !== worldContext.states) {
        state.gameStates = worldContext.states;
      }
    },
    [],
  );

  const updatePhysicsState = useCallback(() => {
    if (!bridgeRef.current) return false;

    const now = performance.now();
    const cache = cacheRef.current;

    const { worldContext, input, urls, getSizesByUrls } = bridgeRef.current;
    const modeType = (worldContext as any)?.mode?.type || 'character';
    const modeControl = (worldContext as any)?.mode?.control || 'thirdPerson';

    if (
      cache.modeType === modeType &&
      cache.modeControl === modeControl &&
      cache.calculationFn &&
      physicsStateRef.current &&
      cache.lastWorldContext === worldContext &&
      cache.lastInput === input &&
      cache.lastUrls === urls
    ) {
      updatePhysicsStateOnly(physicsStateRef.current, worldContext, input);
      return false;
    }

    if (cache.modeType !== modeType) {
      cache.modeType = modeType;
      cache.calculationFn = getCalculationFunction(modeType);
      calculationFnRef.current = cache.calculationFn;
      physicsSync.updateMode((worldContext as any)?.mode);
    }

    cache.modeControl = modeControl;
    cache.lastUpdateTime = now;
    cache.lastWorldContext = worldContext;
    cache.lastInput = input;
    cache.lastUrls = urls;

    if (!worldContext || !input) {
      physicsStateRef.current = null;
      isReadyRef.current = false;
      calculationFnRef.current = null;
      return false;
    }

    const refsReady =
      props.rigidBodyRef?.current && props.outerGroupRef?.current && props.innerGroupRef?.current;
    const layersReady = layerStatus.atomsConnected && layerStatus.contextConnected;
    isReadyRef.current = refsReady && layersReady;

    if (!matchSizesRef.current || cache.lastUrls !== urls) {
      matchSizesRef.current = getSizesByUrls() as SizesType;
    }

    if (!physicsStateRef.current) {
      physicsStateRef.current = createInitialPhysicsState(worldContext, input, modeType);
    } else {
      updatePhysicsStateOnly(physicsStateRef.current, worldContext, input);

      const state = physicsStateRef.current;
      if (state.characterConfig !== (worldContext as any).character) {
        state.characterConfig = (worldContext as any).character || {};
      }
      if (state.vehicleConfig !== (worldContext as any).vehicle) {
        state.vehicleConfig = (worldContext as any).vehicle || {};
      }
      if (state.airplaneConfig !== (worldContext as any).airplane) {
        state.airplaneConfig = (worldContext as any).airplane || {};
      }
      if (state.clickerOption !== (worldContext as any).clickerOption) {
        state.clickerOption = (worldContext as any).clickerOption || state.clickerOption;
      }
      if (state.modeType !== modeType) {
        state.modeType = modeType as 'character' | 'vehicle' | 'airplane';
      }
    }

    calculationFnRef.current = cache.calculationFn || getCalculationFunction(modeType);
    return true;
  }, [updatePhysicsStateOnly]);

  const createInitialPhysicsState = useCallback(
    (worldContext: any, input: any, modeType: string): PhysicsState => {
      return {
        activeState: worldContext.activeState!,
        gameStates: worldContext.states!,
        keyboard: { ...input.keyboard },
        mouse: {
          target: input.mouse.target.clone(),
          angle: input.mouse.angle,
          isActive: input.mouse.isActive,
          shouldRun: input.mouse.shouldRun,
        },
        characterConfig: worldContext.character || {},
        vehicleConfig: worldContext.vehicle || {},
        airplaneConfig: worldContext.airplane || {},
        clickerOption: worldContext.clickerOption || {
          isRun: true,
          throttle: 100,
          autoStart: false,
          track: false,
          loop: false,
          queue: [],
          line: false,
        },
        modeType: modeType as 'character' | 'vehicle' | 'airplane',
      };
    },
    [],
  );

  const executeCharacterPhysics = useCallback((calcProp: PhysicsCalcProps) => {
    const physicsState = physicsStateRef.current;
    if (!physicsState?.activeState || !physicsState?.gameStates || !physicsState?.characterConfig)
      return;
    direction(physicsState, (bridgeRef.current?.worldContext as any)?.mode?.control, calcProp);
    impulse(props.rigidBodyRef, physicsState);
    gravity(props.rigidBodyRef, physicsState);
    innerCalc(props.rigidBodyRef, props.innerGroupRef, physicsState);
  }, []);

  const getCalculationFunction = useCallback(
    (modeType: string) => {
      switch (modeType) {
        case 'vehicle':
          return (calcProp: PhysicsCalcProps) =>
            vehicleCalculation(calcProp, physicsStateRef.current!);
        case 'airplane':
          return (calcProp: PhysicsCalcProps) =>
            airplaneCalculation(calcProp, physicsStateRef.current!);
        default:
          return executeCharacterPhysics;
      }
    },
    [executeCharacterPhysics],
  );

  useUnifiedFrame(
    `physics-${props.rigidBodyRef?.current?.handle || 'unknown'}`,
    (state, delta) => {
      cacheRef.current.skipFrameCount++;
      if (cacheRef.current.skipFrameCount < 2) return;
      cacheRef.current.skipFrameCount = 0;

      if (bridgeRef.current?.blockControl) {
        if (props.rigidBodyRef?.current) {
          props.rigidBodyRef.current.resetForces(false);
          props.rigidBodyRef.current.resetTorques(false);
        }
        return;
      }

      const stateChanged = updatePhysicsState();
      if (!isReadyRef.current || !physicsStateRef.current || !calculationFnRef.current) return;
      if (!bridgeRef.current) return;
      const { worldContext, dispatch, input, setKeyboardInput, setMouseInput } = bridgeRef.current;
      if (!worldContext || !dispatch) return;
      if (!calcPropRef.current || stateChanged) {
        calcPropRef.current = {
          ...props,
          state,
          delta,
          worldContext,
          dispatch,
          matchSizes: matchSizesRef.current || {},
          inputRef: { current: input },
          setKeyboardInput,
          setMouseInput,
        };
      } else {
        calcPropRef.current.state = state;
        calcPropRef.current.delta = delta;
      }

      if (calcPropRef.current) {
        check(
          calcPropRef.current,
          physicsStateRef.current.activeState,
          `physics-${props.rigidBodyRef?.current?.handle || 'unknown'}`,
        );
        calculationFnRef.current(calcPropRef.current);
      }
    },
    0,
    true,
  );
}

import { useEffect, useRef } from 'react';
import { useBridgeConnector } from '../hooks/useBridgeConnector';
import { useUnifiedFrame } from '../hooks/useUnifiedFrame';
import { SizesType } from '../types';
import airplaneCalculation from './airplane';
import { direction } from './character/direction';
import { gravity } from './character/gravity';
import { impulse } from './character/impulse';
import { innerCalc } from './character/innerCalc';
import check from './check';
import { jotaiPhysicsSync, worldContextSync } from './stores/physicsEventBus';
import { PhysicsCalcProps, PhysicsCalculationProps, PhysicsState } from './types';
import vehicleCalculation from './vehicle';

export default function calculation(props: PhysicsCalculationProps) {
  const { bridgeRef, layerStatus } = useBridgeConnector();
  const physicsStateRef = useRef<PhysicsState | null>(null);
  const isReadyRef = useRef(false);
  const matchSizesRef = useRef<SizesType | null>(null);
  const isInitializedRef = useRef(false);
  const calcPropRef = useRef<PhysicsCalcProps | null>(null);
  const calculationFnRef = useRef<((calcProp: PhysicsCalcProps) => void) | null>(null);
  const prevDataRef = useRef<{
    worldContext: any;
    input: any;
    urls: any;
    modeType: string;
    modeControl: string;
  } | null>(null);

  useEffect(() => {
    if (!isInitializedRef.current && bridgeRef.current?.worldContext) {
      worldContextSync.setWorldContext(bridgeRef.current.worldContext as any);
      jotaiPhysicsSync.initialize(
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

  const updatePhysicsState = () => {
    if (!bridgeRef.current) return false;
    
    const { worldContext, input, urls, getSizesByUrls } = bridgeRef.current;
    const prevData = prevDataRef.current;
    const modeType = worldContext?.mode?.type || 'character';
    const modeControl = worldContext?.mode?.control || 'thirdPerson';

    if (
      prevData &&
      prevData.worldContext === worldContext &&
      prevData.input === input &&
      prevData.urls === urls &&
      prevData.modeType === modeType &&
      prevData.modeControl === modeControl
    ) {
      return false;
    }

    if (prevData && (prevData.modeType !== modeType || prevData.modeControl !== modeControl)) {
      worldContextSync.updateMode(worldContext?.mode);
    }

    prevDataRef.current = { worldContext, input, urls, modeType, modeControl };

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

    if (!matchSizesRef.current || prevData?.urls !== urls) {
      matchSizesRef.current = getSizesByUrls(urls) as SizesType;
    }

    if (!physicsStateRef.current) {
      physicsStateRef.current = {
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
    } else {
      const state = physicsStateRef.current;
      state.activeState = worldContext.activeState!;
      state.gameStates = worldContext.states!;
      const kb = state.keyboard;
      const inputKb = input.keyboard;
      kb.forward = inputKb.forward;
      kb.backward = inputKb.backward;
      kb.leftward = inputKb.leftward;
      kb.rightward = inputKb.rightward;
      kb.shift = inputKb.shift;
      kb.space = inputKb.space;
      kb.keyR = inputKb.keyR;
      state.mouse.target.copy(input.mouse.target);
      state.mouse.angle = input.mouse.angle;
      state.mouse.isActive = input.mouse.isActive;
      state.mouse.shouldRun = input.mouse.shouldRun;
      state.characterConfig = worldContext.character || {};
      state.vehicleConfig = worldContext.vehicle || {};
      state.airplaneConfig = worldContext.airplane || {};
      state.clickerOption = worldContext.clickerOption || state.clickerOption;
      state.modeType = modeType as 'character' | 'vehicle' | 'airplane';
    }

    calculationFnRef.current = getCalculationFunction(modeType);
    return true;
  };

  const executeCharacterPhysics = (calcProp: PhysicsCalcProps) => {
    const physicsState = physicsStateRef.current;
    if (!physicsState?.activeState || !physicsState?.gameStates || !physicsState?.characterConfig)
      return;
    direction(physicsState, bridgeRef.current?.worldContext?.mode?.control, calcProp);
    impulse(props.rigidBodyRef, physicsState);
    gravity(props.rigidBodyRef, physicsState);
    innerCalc(props.rigidBodyRef, props.innerGroupRef, physicsState);
  };

  const getCalculationFunction = (modeType: string) => {
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
  };

  useUnifiedFrame(
    `physics-${props.rigidBodyRef?.current?.handle || 'unknown'}`,
    (state, delta) => {
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

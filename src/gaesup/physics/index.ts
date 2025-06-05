import { useCallback, useEffect, useRef } from 'react';
import { useBridgeConnector } from '../hooks/useBridgeConnector';
import { useUnifiedFrame } from '../hooks/useUnifiedFrame';
import { type SizesType } from '../../types';
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
  
  // 캐시 및 성능 최적화 관련 Ref들
  const cacheRef = useRef({
    modeType: '',
    modeControl: '',
    calculationFn: null as ((calcProp: PhysicsCalcProps) => void) | null,
    lastUpdateTime: 0,
    frameSkipCount: 0,
    lastWorldContext: null as any,
    lastInput: null as any,
    lastUrls: null as any,
    skipFrameCount: 0,
  });



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

  // 물리 상태만 업데이트하는 최적화 함수
  const updatePhysicsStateOnly = useCallback((
    state: PhysicsState,
    worldContext: any,
    input: any
  ): void => {
    // 키보드 상태 업데이트 (변경된 값만)
    const kb = state.keyboard;
    const inputKb = input.keyboard;
    if (kb.forward !== inputKb.forward) kb.forward = inputKb.forward;
    if (kb.backward !== inputKb.backward) kb.backward = inputKb.backward;
    if (kb.leftward !== inputKb.leftward) kb.leftward = inputKb.leftward;
    if (kb.rightward !== inputKb.rightward) kb.rightward = inputKb.rightward;
    if (kb.shift !== inputKb.shift) kb.shift = inputKb.shift;
    if (kb.space !== inputKb.space) kb.space = inputKb.space;
    if (kb.keyR !== inputKb.keyR) kb.keyR = inputKb.keyR;
    
    // 마우스 상태 업데이트 (변경된 값만)
    if (!state.mouse.target.equals(input.mouse.target)) {
      state.mouse.target.copy(input.mouse.target);
    }
    if (state.mouse.angle !== input.mouse.angle) state.mouse.angle = input.mouse.angle;
    if (state.mouse.isActive !== input.mouse.isActive) state.mouse.isActive = input.mouse.isActive;
    if (state.mouse.shouldRun !== input.mouse.shouldRun) state.mouse.shouldRun = input.mouse.shouldRun;
    
    // 참조 업데이트 (필요한 경우만)
    if (state.activeState !== worldContext.activeState) {
      state.activeState = worldContext.activeState;
    }
    if (state.gameStates !== worldContext.states) {
      state.gameStates = worldContext.states;
    }
  }, []);

  const updatePhysicsState = useCallback(() => {
    if (!bridgeRef.current) return false;
    
    const now = performance.now();
    const cache = cacheRef.current;
    
    const { worldContext, input, urls, getSizesByUrls } = bridgeRef.current;
    const modeType = worldContext?.mode?.type || 'character';
    const modeControl = worldContext?.mode?.control || 'thirdPerson';



    // 모드가 변경되지 않았고 기존 상태가 있으면 최적화된 업데이트만 수행
    if (
      cache.modeType === modeType && 
      cache.modeControl === modeControl && 
      cache.calculationFn &&
      physicsStateRef.current &&
      cache.lastWorldContext === worldContext &&
      cache.lastInput === input &&
      cache.lastUrls === urls
    ) {
      // 빠른 업데이트 (상태만 변경)
      updatePhysicsStateOnly(physicsStateRef.current, worldContext, input);
      return false; // 새로 생성할 필요 없음
    }

    // 모드 변경 또는 초기 설정시에만 함수 재생성
    if (cache.modeType !== modeType) {
      cache.modeType = modeType;
      cache.calculationFn = getCalculationFunction(modeType);
      calculationFnRef.current = cache.calculationFn;
      worldContextSync.updateMode(worldContext?.mode);
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

    // 크기 정보 캐싱 (URL이 변경되었을 때만 재계산)
    if (!matchSizesRef.current || cache.lastUrls !== urls) {
      matchSizesRef.current = getSizesByUrls(urls) as SizesType;
    }

    // 물리 상태 생성 또는 업데이트
    if (!physicsStateRef.current) {
      physicsStateRef.current = createInitialPhysicsState(worldContext, input, modeType);
    } else {
      updatePhysicsStateOnly(physicsStateRef.current, worldContext, input);
      
      // 설정 업데이트 (필요한 경우만)
      const state = physicsStateRef.current;
      if (state.characterConfig !== worldContext.character) {
        state.characterConfig = worldContext.character || {};
      }
      if (state.vehicleConfig !== worldContext.vehicle) {
        state.vehicleConfig = worldContext.vehicle || {};
      }
      if (state.airplaneConfig !== worldContext.airplane) {
        state.airplaneConfig = worldContext.airplane || {};
      }
      if (state.clickerOption !== worldContext.clickerOption) {
        state.clickerOption = worldContext.clickerOption || state.clickerOption;
      }
      if (state.modeType !== modeType) {
        state.modeType = modeType as 'character' | 'vehicle' | 'airplane';
      }
    }

    calculationFnRef.current = cache.calculationFn || getCalculationFunction(modeType);
    return true;
  }, [updatePhysicsStateOnly]);

  // 초기 물리 상태 생성 함수 (분리하여 가독성 향상)
  const createInitialPhysicsState = useCallback((worldContext: any, input: any, modeType: string): PhysicsState => {
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
  }, []);

  const executeCharacterPhysics = useCallback((calcProp: PhysicsCalcProps) => {
    const physicsState = physicsStateRef.current;
    if (!physicsState?.activeState || !physicsState?.gameStates || !physicsState?.characterConfig)
      return;
    direction(physicsState, bridgeRef.current?.worldContext?.mode?.control, calcProp);
    impulse(props.rigidBodyRef, physicsState);
    gravity(props.rigidBodyRef, physicsState);
    innerCalc(props.rigidBodyRef, props.innerGroupRef, physicsState);
  }, []);

  const getCalculationFunction = useCallback((modeType: string) => {
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
  }, [executeCharacterPhysics]);

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

      // calcProp 재사용 최적화
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
        // 변경된 값만 업데이트
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

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useBridgeConnector } from '../hooks/useBridgeConnector';
import { useUnifiedFrame } from '../hooks/useUnifiedFrame';
import airplaneCalculation from './airplane';
import { direction } from './character/direction';
import { gravity } from './character/gravity';
import { impulse } from './character/impulse';
import { innerCalc } from './character/innerCalc';
import check from './check';
import { worldContextSync } from './stores/physicsEventBus';
import { calcType, PhysicsCalculationProps, PhysicsState } from './type';
import vehicleCalculation from './vehicle';

export default function calculation({
  groundRay,
  rigidBodyRef,
  outerGroupRef,
  innerGroupRef,
  colliderRef,
}: PhysicsCalculationProps) {
  const { bridgeRef, layerStatus } = useBridgeConnector();
  const physicsStateRef = useRef<PhysicsState | null>(null);
  const isReadyRef = useRef(false);
  const matchSizesRef = useRef(null);
  const isInitializedRef = useRef(false);

  const prevStateRef = useRef<{
    worldContext: any;
    controllerContext: any;
    input: any;
    urls: any;
  } | null>(null);

  useEffect(() => {
    if (!isInitializedRef.current && bridgeRef.current.worldContext) {
      worldContextSync.setWorldContext(bridgeRef.current.worldContext);
      isInitializedRef.current = true;
    }
  }, [bridgeRef.current.worldContext]);

  useEffect(() => {
    if (!rigidBodyRef?.current || !innerGroupRef?.current || !isInitializedRef.current) return;
    const { activeState } = bridgeRef.current;
    if (activeState) {
      rigidBodyRef.current.lockRotations(false, true);
      activeState.euler.set(0, 0, 0);
      rigidBodyRef.current.setTranslation(
        { x: activeState.position.x, y: activeState.position.y + 5, z: activeState.position.z },
        true,
      );
    }
  }, [rigidBodyRef?.current, innerGroupRef?.current, isInitializedRef.current]);

  // 🎯 최적화된 상태 업데이트 (변경된 내용만 업데이트)
  const updatePhysicsState = () => {
    const { worldContext, controllerContext, input, urls, getSizesByUrls } = bridgeRef.current;

    // 🔥 변경 사항이 없으면 업데이트 건너뛰기
    const prevState = prevStateRef.current;
    if (
      prevState &&
      prevState.worldContext === worldContext &&
      prevState.controllerContext === controllerContext &&
      prevState.input === input &&
      prevState.urls === urls
    ) {
      return; // 변경 사항 없음
    }

    // 상태 변경 감지됨 - 업데이트 진행
    prevStateRef.current = { worldContext, controllerContext, input, urls };

    if (!worldContext || !controllerContext || !input) {
      physicsStateRef.current = null;
      isReadyRef.current = false;
      return;
    }

    const refsReady = rigidBodyRef?.current && outerGroupRef?.current && innerGroupRef?.current;
    const layersReady = layerStatus.atomsConnected && layerStatus.contextConnected;
    isReadyRef.current = refsReady && layersReady;

    // 🔥 matchSizes도 캐싱하여 불필요한 재계산 방지
    if (!matchSizesRef.current || prevState?.urls !== urls) {
      matchSizesRef.current = getSizesByUrls(urls) as any;
    }

    // 🔥 physicsState 객체 재사용하여 가비지 컬렉션 부담 감소
    if (!physicsStateRef.current) {
      physicsStateRef.current = {
        activeState: worldContext.activeState!,
        gameStates: worldContext.states!,
        keyboard: { ...input.keyboard },
        mouse: {
          target: new THREE.Vector3().copy(input.mouse.target),
          angle: input.mouse.angle,
          isActive: input.mouse.isActive,
          shouldRun: input.mouse.shouldRun,
        },
        characterConfig: controllerContext.character || {},
        vehicleConfig: controllerContext.vehicle || {},
        airplaneConfig: controllerContext.airplane || {},
        clickerOption: worldContext.clickerOption || {
          isRun: true,
          throttle: 100,
          autoStart: false,
          track: false,
          loop: false,
          queue: [],
          line: false,
        },
        modeType: (worldContext.mode?.type || 'character') as 'character' | 'vehicle' | 'airplane',
      };
    } else {
      // 기존 객체 재사용하여 메모리 할당 최소화
      physicsStateRef.current.activeState = worldContext.activeState!;
      physicsStateRef.current.gameStates = worldContext.states!;
      Object.assign(physicsStateRef.current.keyboard, input.keyboard);
      physicsStateRef.current.mouse.target.copy(input.mouse.target);
      physicsStateRef.current.mouse.angle = input.mouse.angle;
      physicsStateRef.current.mouse.isActive = input.mouse.isActive;
      physicsStateRef.current.mouse.shouldRun = input.mouse.shouldRun;
      physicsStateRef.current.characterConfig = controllerContext.character || {};
      physicsStateRef.current.vehicleConfig = controllerContext.vehicle || {};
      physicsStateRef.current.airplaneConfig = controllerContext.airplane || {};
      physicsStateRef.current.clickerOption =
        worldContext.clickerOption || physicsStateRef.current.clickerOption;
      physicsStateRef.current.modeType = (worldContext.mode?.type || 'character') as
        | 'character'
        | 'vehicle'
        | 'airplane';
    }
  };

  const executeCharacterPhysics = (calcProp: calcType) => {
    const physicsState = physicsStateRef.current;
    if (!physicsState?.activeState || !physicsState?.gameStates || !physicsState?.characterConfig) {
      return;
    }

    direction(physicsState, bridgeRef.current.worldContext?.mode?.control, calcProp);
    impulse(rigidBodyRef, physicsState);
    gravity(rigidBodyRef, physicsState);
    innerCalc(rigidBodyRef, innerGroupRef, physicsState);
  };

  const getCalculationFunction = () => {
    const { modeType } = bridgeRef.current;
    switch (modeType) {
      case 'vehicle':
        return vehicleCalculation;
      case 'character':
        return executeCharacterPhysics;
      case 'airplane':
        return airplaneCalculation;
      default:
        return executeCharacterPhysics;
    }
  };

  useUnifiedFrame(
    `physics-${rigidBodyRef?.current?.handle || 'unknown'}`,
    (state, delta) => {
      if (bridgeRef.current.blockControl) {
        if (rigidBodyRef?.current) {
          rigidBodyRef.current.resetForces(false);
          rigidBodyRef.current.resetTorques(false);
        }
        return;
      }
      updatePhysicsState();
      if (!isReadyRef.current || !physicsStateRef.current) return;
      const { worldContext, controllerContext, dispatch, input, setKeyboardInput, setMouseInput } =
        bridgeRef.current;
      if (!worldContext || !dispatch || !controllerContext) return;
      const calcProp: calcType = {
        rigidBodyRef,
        outerGroupRef,
        innerGroupRef,
        colliderRef,
        groundRay,
        state,
        delta,
        worldContext,
        controllerContext,
        dispatch,
        matchSizes: matchSizesRef.current || {},
        inputRef: { current: input },
        setKeyboardInput,
        setMouseInput,
      };
      check(
        calcProp,
        physicsStateRef.current.activeState,
        `physics-${rigidBodyRef?.current?.handle || 'unknown'}`,
      );
      const calculationFunction = getCalculationFunction();
      calculationFunction(calcProp);
    },
    0,
    true,
  );
}

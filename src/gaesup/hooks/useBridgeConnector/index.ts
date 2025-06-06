import { useAtomValue, useSetAtom } from 'jotai';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { blockAtom, urlsAtom } from '../../atoms';
import { animationAtoms } from '../../atoms/animationAtoms';
import { inputAtom, keyboardInputAtom, pointerInputAtom } from '../../atoms/inputAtom';
import { GaesupContext, GaesupDispatchContext } from '../../context';
import { useGaesupGltf } from '../useGaesupGltf';
import { PhysicsBridgeInputData, usePhysicsInput } from '../usePhysicsInput';

/**
 * Bridge Connector Hook
 *
 * 역할: 2번 레이어(atoms)와 3번 레이어(context)를 연결하여
 * 1번 레이어(physics core)에 통합된 데이터를 제공
 *
 * 이 hook은 "진실의 단일 원천" 원칙에 따라
 * 어떤 상태를 어느 레이어에서 가져올지 결정하는 중앙 집중식 connector
 */
export const useBridgeConnector = () => {
  // ============================================================================
  // 2번 레이어 (Atoms) - 선택된 진실의 원천
  // ============================================================================

  // ✅ 입력 시스템: Atoms가 진실의 원천
  const inputSystem = useAtomValue(inputAtom);
  const setKeyboardInput = useSetAtom(keyboardInputAtom);
  const setPointerInput = useSetAtom(pointerInputAtom);
  const urls = useAtomValue(urlsAtom);
  const block = useAtomValue(blockAtom);
  const setCharacterAnimation = useSetAtom(animationAtoms.character);
  const setVehicleAnimation = useSetAtom(animationAtoms.vehicle);
  const setAirplaneAnimation = useSetAtom(animationAtoms.airplane);
  const worldContext = useContext(GaesupContext);
  const worldDispatch = useContext(GaesupDispatchContext);
  useEffect(() => {
    if (!worldContext?.animationState) return;
    const { animationState } = worldContext;
    if (animationState.character) {
      setCharacterAnimation({
        current: animationState.character.current,
        default: animationState.character.default,
        store: animationState.character.store || {},
      });
    }

    if (animationState.vehicle) {
      setVehicleAnimation({
        current: animationState.vehicle.current,
        default: animationState.vehicle.default,
        store: animationState.vehicle.store || {},
      });
    }

    if (animationState.airplane) {
      setAirplaneAnimation({
        current: animationState.airplane.current,
        default: animationState.airplane.default,
        store: animationState.airplane.store || {},
      });
    }
  }, [
    worldContext?.animationState,
    setCharacterAnimation,
    setVehicleAnimation,
    setAirplaneAnimation,
  ]);
  const { getSizesByUrls } = useGaesupGltf();
  const bridgeDataRef = useRef<PhysicsBridgeInputData | null>(null);
  const lastInputSystemRef = useRef(inputSystem);
  const lastUrlsRef = useRef(urls);
  const lastBlockRef = useRef(block);
  const lastWorldContextRef = useRef(worldContext);
  const lastWorldDispatchRef = useRef(worldDispatch);
  const bridgeInputData = useMemo(() => {
    const hasChanged =
      lastInputSystemRef.current !== inputSystem ||
      lastUrlsRef.current !== urls ||
      lastBlockRef.current !== block ||
      lastWorldContextRef.current !== worldContext ||
      lastWorldDispatchRef.current !== worldDispatch;

    if (!hasChanged && bridgeDataRef.current) {
      return bridgeDataRef.current;
    }

    lastInputSystemRef.current = inputSystem;
    lastUrlsRef.current = urls;
    lastBlockRef.current = block;
    lastWorldContextRef.current = worldContext;
    lastWorldDispatchRef.current = worldDispatch;

    const data: PhysicsBridgeInputData = {
      inputSystem: {
        keyboard: inputSystem.keyboard,
        mouse: inputSystem.pointer,
      },
      urls,
      block,
      worldContext,
      controllerContext: worldContext,
      dispatch: worldDispatch,
      setKeyboardInput: (update) => setKeyboardInput(update),
      setMouseInput: (update) => setPointerInput(update),
      getSizesByUrls,
    };
    bridgeDataRef.current = data;
    return data;
  }, [
    inputSystem,
    urls,
    block,
    worldContext,
    worldDispatch,
    setKeyboardInput,
    setPointerInput,
    getSizesByUrls,
  ]);

  // Physics Bridge Hook에 데이터 주입
  const physicsResult = usePhysicsInput(bridgeInputData);

  return {
    // Physics Bridge 결과
    ...physicsResult,

    // 개발/디버깅용 원본 데이터 접근
    rawData: {
      inputSystem,
      urls,
      block,
      worldContext,
      controllerContext: worldContext,
      worldDispatch,
    },

    // 레이어 상태 체크 (개발용)
    layerStatus: {
      atomsConnected: !!(inputSystem && urls && block),
      contextConnected: !!worldContext,
      bridgeReady: !!physicsResult.bridgeRef.current,
      animationSynced: !!worldContext?.animationState,
    },
  };
};

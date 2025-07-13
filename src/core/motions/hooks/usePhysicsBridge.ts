import { useRef, useEffect, useCallback } from 'react';
import { useFrame, RootState } from '@react-three/fiber';
import { BridgeFactory } from '@core/boilerplate';
import { PhysicsBridge } from '../bridge/PhysicsBridge';
import { PhysicsCalculationProps, PhysicsState } from '../types';
import { createInitialPhysicsState } from './state/physicsStateFactory';
import { updateInputState } from '../bridge';
import { useGaesupStore } from '@stores/gaesupStore';
import { useStateSystem } from './useStateSystem';
import { useGaesupGltf } from './useGaesupGltf';
import { InteractionSystem } from '@interactions/core/InteractionSystem';
import { getGlobalStateManager } from './useStateSystem';
import { EntityStateManager } from '../core/system/EntityStateManager';
import { PhysicsCalcProps } from '../core/types';
import { SizesType } from '@stores/slices/sizes';
import { StoreState } from '@stores/types';
import * as THREE from 'three';

export function usePhysicsBridge(props: PhysicsCalculationProps) {
  const physicsStateRef = useRef<PhysicsState | null>(null);
  const mouseTargetRef = useRef(new THREE.Vector3());
  const matchSizesRef = useRef<SizesType | null>(null);
  const stateManagerRef = useRef<EntityStateManager | null>(null);
  const physicsBridgeRef = useRef<PhysicsBridge | null>(null);
  
  const store = useGaesupStore();
  const { activeState } = useStateSystem();
  const interactionSystem = InteractionSystem.getInstance();
  const { getSizesByUrls } = useGaesupGltf();
  
  const interaction = interactionSystem.getState();
  const urls = useGaesupStore((state) => state.urls);
  const isReady = !!(interaction && urls && activeState);

  // 브릿지 초기화
  useEffect(() => {
    const bridge = BridgeFactory.get('physics') as PhysicsBridge | null;
    if (bridge) {
      physicsBridgeRef.current = bridge;
      physicsBridgeRef.current.register('global-physics', store.physics);
    }
    stateManagerRef.current = getGlobalStateManager();
    
    return () => {
      if (physicsBridgeRef.current) {
        physicsBridgeRef.current.unregister('global-physics');
      }
    };
  }, [store.physics]);

  // 설정 업데이트
  useEffect(() => {
    if (physicsBridgeRef.current && store.physics) {
      physicsBridgeRef.current.execute('global-physics', { 
        type: 'updateConfig', 
        data: store.physics 
      });
    }
  }, [store.physics]);

  // Teleport 이벤트 처리
  useEffect(() => {
    const handleTeleport = (event: CustomEvent) => {
      const { position } = event.detail;
      if (props.rigidBodyRef?.current && position) {
        props.rigidBodyRef.current.setTranslation(
          { x: position.x, y: position.y, z: position.z },
          true
        );
        props.rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        props.rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      }
    };
    
    window.addEventListener('gaesup:teleport', handleTeleport as EventListener);
    document.addEventListener('teleport-request', handleTeleport as EventListener);
    
    return () => {
      window.removeEventListener('gaesup:teleport', handleTeleport as EventListener);
      document.removeEventListener('teleport-request', handleTeleport as EventListener);
    };
  }, [props.rigidBodyRef]);

  // 물리 계산 실행
  const executePhysics = useCallback((state: RootState, delta: number) => {
    if (!isReady || !physicsBridgeRef.current || !stateManagerRef.current) return;

    const input = {
      keyboard: interaction.keyboard,
      mouse: interaction.mouse,
      rigidBodyRef: { current: null },
    };

    // 물리 상태 초기화
    if (!physicsStateRef.current) {
      const worldContext = useGaesupStore.getState() as StoreState;
      physicsStateRef.current = createInitialPhysicsState(
        worldContext,
        stateManagerRef.current,
        input,
        delta,
        mouseTargetRef.current
      );

      if (props.rigidBodyRef?.current && physicsStateRef.current.activeState) {
        const { activeState } = physicsStateRef.current;
        props.rigidBodyRef.current.lockRotations(false, true);
        activeState.euler.set(0, 0, 0);
        props.rigidBodyRef.current.setTranslation(
          {
            x: activeState.position.x,
            y: activeState.position.y + 5,
            z: activeState.position.z,
          },
          true
        );
      }
    } else {
      // 입력 상태 업데이트
      updateInputState(physicsStateRef.current, input);
      physicsStateRef.current.activeState = stateManagerRef.current.getActiveState();
      physicsStateRef.current.gameStates = stateManagerRef.current.getGameStates();
      physicsStateRef.current.delta = delta;
    }

    // 물리 계산 속성
    const calcProp: PhysicsCalcProps = {
      rigidBodyRef: props.rigidBodyRef,
      innerGroupRef: props.innerGroupRef,
      state,
      delta,
      worldContext: useGaesupStore.getState(),
      dispatch: () => {},
      matchSizes: matchSizesRef.current || (matchSizesRef.current = getSizesByUrls(urls) as SizesType),
      inputRef: { current: input },
      setKeyboardInput: (input) => interactionSystem.updateKeyboard(input),
      setMouseInput: (input) => interactionSystem.updateMouse(input),
    };

    // 브릿지를 통해 물리 업데이트
    physicsBridgeRef.current.updateEntity('global-physics', {
      deltaTime: delta,
      calcProp,
      physicsState: physicsStateRef.current
    });
  }, [isReady, interaction, urls, getSizesByUrls, props]);

  // 프레임 루프
  useFrame((state, delta) => {
    if (!isReady) return;
    executePhysics(state, delta);
  });

  return {
    isReady,
    bridge: physicsBridgeRef.current,
  };
} 
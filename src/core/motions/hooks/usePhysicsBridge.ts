import { useRef, useEffect, useCallback } from 'react';

import { useFrame, RootState } from '@react-three/fiber';
import * as THREE from 'three';

import { BridgeFactory } from '@core/boilerplate';
import { InteractionSystem } from '@core/interactions/core/InteractionSystem';
import { useGaesupStore } from '@stores/gaesupStore';
import { StoreState } from '@stores/types';

import { updateInputState } from '../bridge';
import { PhysicsBridge } from '../bridge/PhysicsBridge';
import { createInitialPhysicsState } from './state/physicsStateFactory';
import { getGlobalStateManager } from './useStateSystem';
import { EntityStateManager } from '../core/system/EntityStateManager';
import { PhysicsCalculationProps, PhysicsInputState, PhysicsState } from '../types';
import { PhysicsCalcProps } from '../types';



export function usePhysicsBridge(
  props: PhysicsCalculationProps & { enabled?: boolean }
) {
  const { enabled = true } = props;
  const physicsStateRef = useRef<PhysicsState | null>(null);
  const mouseTargetRef = useRef(new THREE.Vector3());
  const stateManagerRef = useRef<EntityStateManager | null>(null);
  const physicsBridgeRef = useRef<PhysicsBridge | null>(null);
  const registeredRef = useRef(false);
  const physicsConfig = useGaesupStore((state) => state.physics);
  const initialPhysicsConfigRef = useRef(physicsConfig);
  const interactionSystem = InteractionSystem.getInstance();
  
  const interaction = interactionSystem.getState();
  const isReady = enabled;

  useEffect(() => {
    if (!registeredRef.current) {
      initialPhysicsConfigRef.current = physicsConfig;
    }
  }, [physicsConfig]);

  // 브릿지 초기화
  useEffect(() => {
    stateManagerRef.current = getGlobalStateManager();
    if (!enabled) {
      if (registeredRef.current) {
        physicsBridgeRef.current?.unregister('global-physics');
        registeredRef.current = false;
      }
      physicsStateRef.current = null;
      return undefined;
    }

    const bridge = BridgeFactory.getOrCreate('physics') as PhysicsBridge | null;
    if (bridge) {
      physicsBridgeRef.current = bridge;
      if (!registeredRef.current) {
        physicsBridgeRef.current.register(
          'global-physics',
          initialPhysicsConfigRef.current
        );
        registeredRef.current = true;
      }
    }
    
    return () => {
      if (registeredRef.current && physicsBridgeRef.current) {
        physicsBridgeRef.current.unregister('global-physics');
        registeredRef.current = false;
      }
      physicsStateRef.current = null;
    };
  }, [enabled]);

  // 설정 업데이트
  useEffect(() => {
    if (enabled && registeredRef.current && physicsBridgeRef.current) {
      physicsBridgeRef.current.execute('global-physics', { 
        type: 'updateConfig', 
        data: physicsConfig 
      });
    }
  }, [enabled, physicsConfig]);

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
    if (!enabled || !physicsBridgeRef.current || !stateManagerRef.current) return;

    const input: PhysicsInputState = {
      keyboard: interaction.keyboard,
      mouse: interaction.mouse,
    };

    let physicsState = physicsStateRef.current;
    // 물리 상태 초기화
    if (!physicsState) {
      const worldContext = useGaesupStore.getState() as StoreState;
      physicsState = createInitialPhysicsState(
        worldContext,
        stateManagerRef.current,
        input,
        delta,
        mouseTargetRef.current
      );
      physicsStateRef.current = physicsState;

      if (physicsState.activeState) {
        const { activeState } = physicsState;
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
      updateInputState(physicsState, input);
      physicsState.activeState = stateManagerRef.current.getActiveState();
      physicsState.gameStates = stateManagerRef.current.getGameStates();
      physicsState.delta = delta;
    }

    // 물리 계산 속성
    const calcProp: PhysicsCalcProps = {
      rigidBodyRef: props.rigidBodyRef,
      state,
      delta,
      worldContext: useGaesupStore.getState(),
      dispatch: () => {},
      inputRef: { current: input },
      setKeyboardInput: (input) => interactionSystem.updateKeyboard(input),
      setMouseInput: (input) => interactionSystem.updateMouse(input),
      ...(props.innerGroupRef ? { innerGroupRef: props.innerGroupRef } : {}),
    };

    // 브릿지를 통해 물리 업데이트
    physicsBridgeRef.current.updateEntity('global-physics', {
      deltaTime: delta,
      calcProp,
      physicsState
    });
  }, [enabled, interaction, interactionSystem, props]);

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
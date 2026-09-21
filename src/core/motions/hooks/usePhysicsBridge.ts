import { useRef, useEffect, useCallback, useId, useMemo, useState } from 'react';

import { useFrame, RootState } from '@react-three/fiber';
import * as THREE from 'three';

import { createInteractionInputAdapter, type InputAdapter } from '@core/interactions/core';
import { InMemoryEventBus } from '@core/plugins';
import {
  useGaesupRuntime,
  useGaesupRuntimeRevision,
} from '@core/runtime';
import { useGaesupStore, useGaesupStoreApi } from '@stores/gaesupStore';
import { StoreState } from '@stores/types';

import { useWorldPhysicsStep } from '../../simulation/physicsContext';
import { updateInputState } from '../bridge';
import { PhysicsBridge } from '../bridge/PhysicsBridge';
import {
  DEFAULT_MOTIONS_RUNTIME_SERVICE_ID,
  MOTIONS_TELEPORT_EVENT,
  type MotionsRuntime,
  type MotionsRuntimeService,
  type MotionsTeleportPayload,
} from '../plugin';
import { createInitialPhysicsState } from './state/physicsStateFactory';
import { subscribeLegacyTeleportEvents } from './teleportEvents';
import { getGlobalStateManager } from './useStateSystem';
import { EntityStateManager } from '../core/system/EntityStateManager';
import { PhysicsCalculationProps, PhysicsInputState, PhysicsState } from '../types';
import { PhysicsCalcProps } from '../types';



export interface UsePhysicsBridgeOptions extends PhysicsCalculationProps {
  physicsWorld?: PhysicsCalcProps['physicsWorld'];
  entityId?: string;
  enabled?: boolean;
  motionsRuntime?: MotionsRuntime;
  allowLegacyFallback?: boolean;
}

type PhysicsRegistration = {
  bridge: PhysicsBridge;
  entityId: string;
};

let nextFallbackPhysicsEntityId = 0;
let fallbackMotionsRuntime: MotionsRuntime | null = null;

function createFallbackPhysicsEntityId(reactEntityId: string): string {
  nextFallbackPhysicsEntityId += 1;
  return `physics-${reactEntityId}-${nextFallbackPhysicsEntityId}`;
}

function createFallbackMotionsRuntime(): MotionsRuntime {
  return {
    physicsBridge: new PhysicsBridge(),
    inputAdapter: createInteractionInputAdapter(),
    events: new InMemoryEventBus(),
    extensionIds: {
      physics: 'fallback.physics.bridge',
      input: 'fallback.interaction.input',
    },
  };
}

function getFallbackMotionsRuntime(): MotionsRuntime {
  fallbackMotionsRuntime ??= createFallbackMotionsRuntime();
  return fallbackMotionsRuntime;
}

export function usePhysicsBridge(props: UsePhysicsBridgeOptions) {
  const storeApi = useGaesupStoreApi();
  const { enabled: requestedEnabled = true, allowLegacyFallback = true } = props;
  const reactEntityId = useId();
  const [fallbackEntityId] = useState(() => createFallbackPhysicsEntityId(reactEntityId));
  const entityId = props.entityId ?? fallbackEntityId;
  const contextRuntime = useGaesupRuntime();
  const enabled = requestedEnabled && (!contextRuntime || contextRuntime.isActive());
  const contextRuntimeRevision = useGaesupRuntimeRevision();
  const contextMotionsRuntime = useMemo(() => {
    if (props.motionsRuntime || !contextRuntime || !contextRuntime.isActive()) return null;
    const service = contextRuntime.getService<MotionsRuntimeService>(DEFAULT_MOTIONS_RUNTIME_SERVICE_ID);
    return service?.create() ?? null;
  }, [contextRuntime, contextRuntimeRevision, props.motionsRuntime]);
  const fallbackRuntime = useMemo(() => {
    if (props.motionsRuntime || contextMotionsRuntime || !allowLegacyFallback) return null;
    if (contextRuntime) return contextRuntime.isActive() ? contextRuntime.motions : null;
    return getFallbackMotionsRuntime();
  }, [allowLegacyFallback, contextMotionsRuntime, props.motionsRuntime, contextRuntime, contextRuntimeRevision]);
  const motionsRuntime = props.motionsRuntime ?? contextMotionsRuntime ?? fallbackRuntime;
  const physicsStateRef = useRef<PhysicsState | null>(null);
  const mouseTargetRef = useRef(new THREE.Vector3());
  const stateManagerRef = useRef<EntityStateManager | null>(null);
  const physicsBridgeRef = useRef<PhysicsBridge | null>(null);
  const registrationRef = useRef<PhysicsRegistration | null>(null);
  const physicsConfig = useGaesupStore((state) => state.physics);
  const latestPhysicsConfigRef = useRef(physicsConfig);
  latestPhysicsConfigRef.current = physicsConfig;
  const fallbackInputAdapterRef = useRef<InputAdapter | null>(null);
  fallbackInputAdapterRef.current ??= createInteractionInputAdapter();
  const inputAdapter = motionsRuntime?.inputAdapter ?? fallbackInputAdapterRef.current;
  const inputAdapterRef = useRef<InputAdapter>(inputAdapter);
  inputAdapterRef.current = inputAdapter;

  const isReady = enabled && Boolean(motionsRuntime);

  const inputRef = useRef<PhysicsInputState>({
    keyboard: inputAdapter.getKeyboard(),
    mouse: inputAdapter.getMouse(),
    gamepad: inputAdapter.getGamepad?.(),
  });
  const calcPropRef = useRef<PhysicsCalcProps | null>(null);

  const setKeyboardInputRef = useRef((input: Partial<PhysicsInputState['keyboard']>) => {
    inputAdapterRef.current.updateKeyboard(input);
  });
  const setMouseInputRef = useRef((input: Partial<PhysicsInputState['mouse']>) => {
    inputAdapterRef.current.updateMouse(input);
  });

  // 브릿지 초기화
  useEffect(() => {
    stateManagerRef.current = contextRuntime?.stateManager ?? getGlobalStateManager();
    const bridge = enabled ? motionsRuntime?.physicsBridge : undefined;
    if (!bridge) {
      physicsBridgeRef.current = null;
      physicsStateRef.current = null;
      return undefined;
    }

    const registration = { bridge, entityId };
    physicsBridgeRef.current = bridge;
    bridge.register(entityId, latestPhysicsConfigRef.current, stateManagerRef.current, {
      inputAdapter,
      ...(contextRuntime ? { navigation: contextRuntime.navigation, clickNavigation: contextRuntime.clickNavigation } : {}),
    });
    registrationRef.current = registration;

    return () => {
      bridge.unregister(entityId);
      if (registrationRef.current === registration) {
        registrationRef.current = null;
        physicsBridgeRef.current = null;
        physicsStateRef.current = null;
      }
    };
  }, [enabled, entityId, motionsRuntime?.physicsBridge, contextRuntime, inputAdapter]);

  // 설정 업데이트
  useEffect(() => {
    const registration = registrationRef.current;
    if (enabled && registration) {
      registration.bridge.execute(registration.entityId, {
        type: 'updateConfig',
        data: physicsConfig,
      });
    }
  }, [enabled, entityId, motionsRuntime?.physicsBridge, physicsConfig]);

  // Teleport 이벤트 처리
  useEffect(() => {
    const teleportTo = (position: MotionsTeleportPayload['position'] | undefined) => {
      if (props.rigidBodyRef?.current && position) {
        props.rigidBodyRef.current.setTranslation(
          { x: position.x, y: position.y, z: position.z },
          true
        );
        props.rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        props.rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      }
    };
    const handleRuntimeTeleport = (payload: MotionsTeleportPayload) => {
      teleportTo(payload.position);
    };
    const unsubscribeRuntimeTeleport = motionsRuntime?.events.on(
      MOTIONS_TELEPORT_EVENT,
      handleRuntimeTeleport,
    );
    const unsubscribeLegacyTeleport = !contextRuntime && motionsRuntime === fallbackRuntime
      ? subscribeLegacyTeleportEvents(handleRuntimeTeleport)
      : undefined;
    
    return () => {
      unsubscribeRuntimeTeleport?.();
      unsubscribeLegacyTeleport?.();
    };
  }, [fallbackRuntime, motionsRuntime, motionsRuntime?.events, props.rigidBodyRef, contextRuntime]);

  // 물리 계산 실행
  const executePhysics = useCallback((state: RootState, delta: number) => {
    const registration = registrationRef.current;
    if (!enabled || !registration || !stateManagerRef.current || !props.rigidBodyRef.current) return;

    const worldContext = storeApi.getState() as StoreState;
    const input = inputRef.current;
    input.keyboard = inputAdapter.getKeyboard();
    input.mouse = inputAdapter.getMouse();
    input.gamepad = inputAdapter.getGamepad?.();

    let physicsState = physicsStateRef.current;
    // 물리 상태 초기화
    if (!physicsState) {
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

    physicsState.modeType = worldContext.mode?.type ?? 'character';
    physicsState.automationOption = worldContext.automation;

    // 매 프레임 객체 할당을 피하기 위해 calcProp 을 ref 로 재사용한다.
    let calcProp = calcPropRef.current;
    if (!calcProp) {
      calcProp = {
        rigidBodyRef: props.rigidBodyRef,
        ...(props.physicsWorld ? { physicsWorld: props.physicsWorld } : {}),
        ...(props.groundContactFilter ? { groundContactFilter: props.groundContactFilter } : {}),
        state,
        delta,
        worldContext,
        dispatch: () => {},
        inputRef,
        setKeyboardInput: setKeyboardInputRef.current,
        setMouseInput: setMouseInputRef.current,
        ...(props.colliderSize ? { colliderSize: props.colliderSize } : {}),
        ...(props.innerGroupRef ? { innerGroupRef: props.innerGroupRef } : {}),
      };
      calcPropRef.current = calcProp;
    } else {
      calcProp.rigidBodyRef = props.rigidBodyRef;
      if (props.physicsWorld) calcProp.physicsWorld = props.physicsWorld;
      else delete calcProp.physicsWorld;
      if (props.groundContactFilter) calcProp.groundContactFilter = props.groundContactFilter;
      else delete calcProp.groundContactFilter;
      calcProp.state = state;
      calcProp.delta = delta;
      calcProp.worldContext = worldContext;
      if (props.colliderSize) {
        calcProp.colliderSize = props.colliderSize;
      } else {
        delete calcProp.colliderSize;
      }
      if (props.innerGroupRef) {
        calcProp.innerGroupRef = props.innerGroupRef;
      }
    }

    // 브릿지를 통해 물리 업데이트
    registration.bridge.updateEntity(registration.entityId, {
      deltaTime: delta,
      calcProp,
      physicsState
    });
  }, [enabled, inputAdapter, props, storeApi]);

  const fixedPhysics = useWorldPhysicsStep(executePhysics, isReady);

  // Plain Rapier Physics remains supported for consumers that own their simulation loop.
  useFrame((state, delta) => {
    if (!isReady || fixedPhysics) return;
    executePhysics(state, delta);
  });

  return {
    isReady,
    bridge: physicsBridgeRef.current,
  };
} 

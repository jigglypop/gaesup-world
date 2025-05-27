'use client';
import * as THREE from 'three';
import { useRef, useReducer, useMemo } from 'react';
import { Collider } from '@dimforge/rapier3d-compat';
import { RapierRigidBody } from '@react-three/rapier';
import { useContextBridge } from '@react-three/drei';
import { GaesupWorldContext } from '../world/context';
import { useMainFrameLoop } from '../hooks/useUnifiedFrame';
import { useKeyboard } from '../hooks/useKeyboard';
import {
  GaesupControllerContext,
  GaesupControllerDispatchContext,
  gaesupControllerDefault,
} from './context';
import { gaesupControllerReducer } from './context/reducer';
import initControllerProps from './initialize';
import { GaesupComponent } from '../component';
import { controllerType, controllerInnerType } from './type';

export function GaesupController(props: controllerType) {
  return <GaesupControllerInner {...props}>{props.children}</GaesupControllerInner>;
}

export function GaesupControllerInner(props: controllerType) {
  // 통합 프레임 루프 시작 (Canvas 내부에서 실행)
  useMainFrameLoop();
  
  // 키보드 이벤트 리스너 시작
  useKeyboard();

  const colliderRef = useRef<Collider>(null),
    rigidBodyRef = useRef<RapierRigidBody>(null),
    outerGroupRef = useRef<THREE.Group>(null),
    innerGroupRef = useRef<THREE.Group>(null),
    characterInnerRef = useRef<THREE.Group>(null),
    passiveRigidBodyRef = useRef<RapierRigidBody>(null);
  const [controller, controllerDispatch] = useReducer(gaesupControllerReducer, {
    airplane: { ...gaesupControllerDefault.airplane, ...props.airplane },
    vehicle: { ...gaesupControllerDefault.vehicle, ...props.vehicle },
    character: { ...gaesupControllerDefault.character, ...props.character },
    callbacks: {
      ...gaesupControllerDefault.callbacks,
      onReady: props.onReady,
      onFrame: props.onFrame,
      onDestory: props.onDestory,
      onAnimate: props.onAnimate,
    },
    refs: { colliderRef, rigidBodyRef, outerGroupRef, innerGroupRef, characterInnerRef },
    controllerOptions: { ...gaesupControllerDefault.controllerOptions, ...props.controllerOptions },
  });
  const gaesupControl = useMemo(
    () => ({ value: controller, dispatch: controllerDispatch }),
    [controller],
  );
  const refs = useMemo(
    () => ({
      colliderRef,
      rigidBodyRef,
      outerGroupRef,
      innerGroupRef,
      characterInnerRef,
      passiveRigidBodyRef,
    }),
    [colliderRef, rigidBodyRef, outerGroupRef, innerGroupRef, characterInnerRef, passiveRigidBodyRef],
  );
  const prop: controllerInnerType = {
    ...initControllerProps({ refs }),
    children: props.children,
    groupProps: props.groupProps,
    rigidBodyProps: props.rigidBodyProps,
    controllerOptions: gaesupControl.value.controllerOptions,
    parts: props.parts,
    ...gaesupControl.value.callbacks,
    ...refs,
  };
  const ContextBridge = useContextBridge(GaesupWorldContext, GaesupControllerContext);
  return (
    <ContextBridge>
      <GaesupControllerContext.Provider value={gaesupControl.value}>
        <GaesupControllerDispatchContext.Provider value={gaesupControl.dispatch}>
          <GaesupComponent props={prop} refs={refs} />
        </GaesupControllerDispatchContext.Provider>
      </GaesupControllerContext.Provider>
    </ContextBridge>
  );
}

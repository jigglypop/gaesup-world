'use client';
import { Collider } from '@dimforge/rapier3d-compat';
import { useContextBridge } from '@react-three/drei';
import { RapierRigidBody } from '@react-three/rapier';
import { ReactElement, useMemo, useReducer, useRef } from 'react';
import * as THREE from 'three';
import { GaesupComponent } from '../component';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMainFrameLoop } from '../hooks/useUnifiedFrame';
import { GaesupWorldContext } from '../world/context';
import {
  GaesupControllerContext,
  GaesupControllerDispatchContext,
  gaesupControllerDefault,
} from './context';
import { gaesupControllerReducer } from './context/reducer';
import initControllerProps from './initialize';
import { controllerInnerType, controllerType } from './type';

export function GaesupController(props: controllerType): ReactElement {
  return <GaesupControllerInner {...props}>{props.children}</GaesupControllerInner>;
}

export function GaesupControllerInner(props: controllerType): ReactElement {
  useMainFrameLoop();
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
    [
      colliderRef,
      rigidBodyRef,
      outerGroupRef,
      innerGroupRef,
      characterInnerRef,
      passiveRigidBodyRef,
    ],
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

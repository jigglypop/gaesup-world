'use client';
import { Collider } from '@dimforge/rapier3d-compat';
import { useContextBridge } from '@react-three/drei';
import { RapierRigidBody } from '@react-three/rapier';
import { ReactElement, useRef } from 'react';
import * as THREE from 'three';
import { GaesupComponent } from '../component';
import { GaesupContext } from '../atoms';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMainFrameLoop } from '../hooks/useUnifiedFrame';
import initControllerProps from './initialize';
import { controllerInnerType, controllerType } from './types';

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
  const refs = {
    colliderRef,
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    characterInnerRef,
    passiveRigidBodyRef,
  };
  const prop: controllerInnerType = {
    ...initControllerProps({ refs }),
    children: props.children,
    groupProps: props.groupProps || {},
    rigidBodyProps: props.rigidBodyProps || {},
    controllerOptions: props.controllerOptions || {
      lerp: {
        cameraTurn: 1,
        cameraPosition: 1,
      },
    },
    parts: props.parts || [],
    onReady: props.onReady || (() => {}),
    onFrame: props.onFrame || (() => {}),
    onDestory: props.onDestory || (() => {}),
    onAnimate: props.onAnimate || (() => {}),
    ...refs,
  } as controllerInnerType;
  const ContextBridge = useContextBridge(GaesupContext);
  return (
    <ContextBridge>
      <GaesupComponent props={prop} refs={refs} />
    </ContextBridge>
  );
}

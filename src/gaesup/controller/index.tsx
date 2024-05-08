"use client";

import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { useContext, useMemo, useReducer, useRef } from "react";
import * as THREE from "three";

import { KeyboardControls, useContextBridge } from "@react-three/drei";
import { GaesupComponent } from "../component";
import { GaesupWorldContext } from "../world/context";
import {
  GaesupControllerContext,
  GaesupControllerDispatchContext,
  gaesupControllerDefault,
} from "./context";
import { gaesupControllerReducer } from "./context/reducer";
import initDebug from "./debug";
import initControllerProps from "./initialize";
import { controllerInnerType, controllerType } from "./type";

export function GaesupController(props: controllerType) {
  const { keyBoardMap } = useContext(GaesupWorldContext);

  return (
    <KeyboardControls map={keyBoardMap}>
      <GaesupControllerInner {...props}>{props.children}</GaesupControllerInner>
    </KeyboardControls>
  );
}

export function GaesupControllerInner(props: controllerType) {
  const colliderRef = useRef<Collider>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const characterInnerRef = useRef<THREE.Group>(null);
  const passiveRigidBodyRef = useRef<RapierRigidBody>(null);

  const [controller, controllerDispatch] = useReducer(gaesupControllerReducer, {
    airplane: Object.assign(
      gaesupControllerDefault.airplane,
      props.airplane || {}
    ),
    vehicle: Object.assign(
      gaesupControllerDefault.vehicle,
      props.vehicle || {}
    ),
    character: Object.assign(
      gaesupControllerDefault.character,
      props.character || {}
    ),
    callbacks: Object.assign(gaesupControllerDefault.callbacks, {
      onReady: props.onReady,
      onFrame: props.onFrame,
      onDestory: props.onDestory,
      onAnimate: props.onAnimate,
    }),
    refs: {
      colliderRef,
      rigidBodyRef,
      outerGroupRef,
      innerGroupRef,
      characterInnerRef,
    },
    controllerOptions: Object.assign(
      gaesupControllerDefault.controllerOptions,
      props.controllerOptions || {}
    ),
  });

  const gaesupControl = useMemo(
    () => ({
      value: controller,
      dispatch: controllerDispatch,
    }),
    []
  );

  const refs = useMemo(() => {
    return {
      colliderRef,
      rigidBodyRef,
      outerGroupRef,
      innerGroupRef,
      characterInnerRef,
      passiveRigidBodyRef,
    };
  }, []);

  const prop: controllerInnerType = {
    ...initControllerProps({
      refs,
    }),
    children: props.children,
    groupProps: props.groupProps,
    rigidBodyProps: props.rigidBodyProps,
    controllerOptions: gaesupControl.value.controllerOptions,
    ...gaesupControl.value.callbacks,
    ...refs,
  };

  initDebug({
    controllerContext: gaesupControl.value,
    controllerDispatch: gaesupControl.dispatch,
  });

  const ContextBridge = useContextBridge(
    GaesupWorldContext,
    GaesupControllerContext
  );

  return (
    <ContextBridge>
      <GaesupControllerContext.Provider value={gaesupControl.value}>
        <GaesupControllerDispatchContext.Provider
          value={gaesupControl.dispatch}
        >
          <GaesupComponent props={prop} refs={refs} />
        </GaesupControllerDispatchContext.Provider>
      </GaesupControllerContext.Provider>
    </ContextBridge>
  );
}

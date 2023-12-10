"use client";

import { useContext, useMemo, useReducer, useRef } from "react";

import { Collider, RevoluteImpulseJoint } from "@dimforge/rapier3d-compat";
import { Airplane } from "../component/Airplane";
import { Character } from "../component/Character";
import { Vehicle } from "../component/Vehicle";

import { RapierRigidBody } from "@react-three/rapier";
import Camera from "../camera";
import initControllerProps from "../initial/initControllerProps";
import { GaesupWorldContext } from "../stores/context";
import {
  GaesupControllerContext,
  GaesupControllerDispatchContext,
  gaesupControllerDefault,
  gaesupControllerReducer,
} from "../stores/context/controller";
import { controllerType, propType, refsType } from "./type";

export default function GaesupController(props: controllerType) {
  const { mode } = useContext(GaesupWorldContext);
  const [controller, controllerDispatch] = useReducer(gaesupControllerReducer, {
    cameraMode: Object.assign(
      gaesupControllerDefault.cameraMode,
      props.cameraMode || {}
    ),
    cameraOption: Object.assign(
      gaesupControllerDefault.cameraOption,
      props.cameraOption || {}
    ),
    perspectiveCamera: Object.assign(
      gaesupControllerDefault.perspectiveCamera,
      props.perspectiveCamera || {}
    ),
    orthographicCamera: Object.assign(
      gaesupControllerDefault.orthographicCamera,
      props.orthographicCamera || {}
    ),
  });

  const capsuleColliderRef = useRef<Collider>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const slopeRayOriginRef = useRef<THREE.Mesh>(null);
  const jointRefs = useRef<RevoluteImpulseJoint>(null);

  const gaesupControl = useMemo(
    () => ({
      value: controller,
      dispatch: controllerDispatch,
    }),
    [
      controller.cameraMode,
      controller.cameraOption,
      controller.perspectiveCamera,
      controller.orthographicCamera,
      controllerDispatch,
    ]
  );

  const refs: refsType = {
    capsuleColliderRef,
    rigidBodyRef,
    outerGroupRef,
    slopeRayOriginRef,
    jointRefs,
  };

  const prop: propType = {
    ...initControllerProps({
      props,
      refs,
    }),
    callbacks: {
      onReady: props.onReady,
      onFrame: props.onFrame,
      onDestory: props.onDestory,
      onAnimate: props.onAnimate,
    },
    children: props.children,
    groupProps: props.groupProps,
    ...refs,
  };

  return (
    <GaesupControllerContext.Provider value={gaesupControl.value}>
      <Camera refs={refs} prop={prop} control={prop.keyControl} />
      <GaesupControllerDispatchContext.Provider value={gaesupControl.dispatch}>
        {mode.type === "character" && (
          <Character controllerProps={prop} refs={refs} />
        )}
        {mode.type === "vehicle" && (
          <Vehicle controllerProps={prop} refs={refs} />
        )}
        {mode.type === "airplane" && (
          <Airplane controllerProps={prop} refs={refs} />
        )}
      </GaesupControllerDispatchContext.Provider>
    </GaesupControllerContext.Provider>
  );
}

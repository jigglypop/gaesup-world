import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { useContext, useMemo, useReducer, useRef } from "react";
import Camera from "../camera";

import { KeyboardControls } from "@react-three/drei";
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
  const capsuleColliderRef = useRef<Collider>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const slopeRayOriginRef = useRef<THREE.Mesh>(null);
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
      capsuleColliderRef,
      rigidBodyRef,
      outerGroupRef,
      innerGroupRef,
      slopeRayOriginRef,
      characterInnerRef,
    },
    isRider: props.isRider !== null ? props.isRider : false,
  });

  const gaesupControl = useMemo(
    () => ({
      value: controller,
      dispatch: controllerDispatch,
    }),
    [controller, controllerDispatch]
  );

  const refs = useMemo(() => {
    return {
      capsuleColliderRef,
      rigidBodyRef,
      outerGroupRef,
      innerGroupRef,
      slopeRayOriginRef,
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
    ...gaesupControl.value.callbacks,
    ...refs,
  };

  initDebug({
    controllerContext: gaesupControl.value,
    controllerDispatch: gaesupControl.dispatch,
  });

  return (
    <GaesupControllerContext.Provider value={gaesupControl.value}>
      <Camera refs={refs} prop={prop} control={prop.keyControl} />
      <GaesupControllerDispatchContext.Provider value={gaesupControl.dispatch}>
        <GaesupComponent props={prop} refs={refs} />
      </GaesupControllerDispatchContext.Provider>
    </GaesupControllerContext.Provider>
  );
}

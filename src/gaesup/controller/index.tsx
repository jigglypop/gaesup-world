import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { useMemo, useReducer, useRef } from "react";
import Camera from "../camera";

import { GaesupComponent } from "../component";
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
  const capsuleColliderRef = useRef<Collider>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const slopeRayOriginRef = useRef<THREE.Mesh>(null);
  const characterInnerRef = useRef<THREE.Group>(null);
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
    [
      controller,
      controllerDispatch,
      // controller.cameraMode,
      // controller.cameraOption,
      // controller.perspectiveCamera,
      // controller.orthographicCamera,
      // controller.airplane,
      // controller.vehicle,
      // controller.character,
      // controller.callbacks,
      // controller.isRider,
      // controller.refs,
    ]
  );

  const refs = useMemo(() => {
    return {
      capsuleColliderRef,
      rigidBodyRef,
      outerGroupRef,
      innerGroupRef,
      slopeRayOriginRef,
      characterInnerRef,
    };
  }, []);
  const prop: controllerInnerType = {
    ...initControllerProps({
      controllerContext: gaesupControl.value,
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

import { Collider, RevoluteImpulseJoint } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { useContext, useMemo, useReducer, useRef } from "react";
import Camera from "../camera";
import { Airplane } from "../component/Airplane";
import { Character } from "../component/Character";
import { Vehicle } from "../component/Vehicle";

import { GaesupWorldContext } from "../world/context";
import {
  GaesupControllerContext,
  GaesupControllerDispatchContext,
  gaesupControllerDefault,
} from "./context";
import { gaesupControllerReducer } from "./context/reducer";
import initControllerProps from "./initialize";
import { controllerType, propType, refsType } from "./type";

export function GaesupController(props: controllerType) {
  const capsuleColliderRef = useRef<Collider>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const slopeRayOriginRef = useRef<THREE.Mesh>(null);
  const characterInnerRef = useRef<THREE.Group>(null);
  const jointRefs = useRef<RevoluteImpulseJoint>(null);
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
    isRider: props.isRider !== null ? props.isRider : false,
  });

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
      controller.airplane,
      controller.vehicle,
      controller.character,
      controller.callbacks,
      controller.isRider,
    ]
  );

  const refs: refsType = {
    capsuleColliderRef,
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    slopeRayOriginRef,
    characterInnerRef,
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
    isRider: props.isRider !== null ? props.isRider : false,
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

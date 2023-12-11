import { useKeyboardControls } from "@react-three/drei";
import { vec3 } from "@react-three/rapier";
import { useCallback, useContext, useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  constantType,
  controllerType,
  groundRayType,
  refsType,
  slopeRayType,
} from "../../controller/type";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../stores/context/gaesupworld";
import { keyControlType } from "../../stores/control/type";
import initDebug from "./initDebug";

export default function initControllerProps({
  props,
  refs,
}: {
  props: controllerType;
  refs: refsType;
}) {
  const context = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { control, mode } = useContext(GaesupWorldContext);
  const [_, getKeys] = useKeyboardControls();
  const keyControl: keyControlType = getKeys();

  useEffect(() => {
    if (keyControl && control) {
      dispatch({
        type: "update",
        payload: {
          control: {
            ...(mode.controller === "keyboard" ? keyControl : control),
          },
        },
      });
    }
  }, [mode.controller, keyControl, control]);

  const groundRay: groundRayType = useMemo(() => {
    return {
      origin: vec3(),
      dir: vec3({ x: 0, y: -1, z: 0 }),
      offset: vec3({ x: 0, y: -context.characterCollider.halfHeight, z: 0 }),
      hit: null,
      parent: null,
      rayCast: null,
      length: 0.5,
    };
  }, []);

  const slopeRay: slopeRayType = useMemo(() => {
    return {
      current: vec3(),
      origin: vec3(),
      hit: null,
      rayCast: null,
      dir: vec3({ x: 0, y: -1, z: 0 }),
      offset: vec3({ x: 0, y: 0, z: context.characterCollider.radius - 0.03 }),
      length: context.characterCollider.radius + 3,
      angle: 0,
    };
  }, []);

  let constant: constantType = useMemo(() => {
    return {
      jumpSpeed: 5,
      turnSpeed: 10,
      walkSpeed: 4,
      runSpeed: 10,
      accelRate: 5,
      brakeRate: 5,
      wheelOffset: 0.1,
      linearDamping: 1,
      cameraInitDistance: -5,
      cameraMaxDistance: -7,
      cameraMinDistance: -0.7,
      cameraInitDirection: 0,
      cameraCollisionOff: 0.7,
      cameraDistance: -1,
      cameraCamFollow: 11,
    };
  }, []);

  const cameraRay = useMemo(() => {
    return {
      origin: vec3(),
      hit: new THREE.Raycaster(),
      rayCast: new THREE.Raycaster(vec3(), vec3(), 0, -7),
      lerpingPoint: vec3(),
      dir: vec3(),
      position: vec3(),
      length: -1,
      followCamera: new THREE.Object3D(),
      pivot: new THREE.Object3D(),
      intersetesAndTransParented: [],
      intersects: [],
      intersectObjects: [],
      intersectObjectMap: {},
    };
  }, []);
  cameraRay.rayCast = new THREE.Raycaster(
    cameraRay.origin,
    cameraRay.dir,
    0,
    -constant.cameraMaxDistance
  );

  const initRefs = useCallback(
    (refs: refsType) => {
      dispatch({
        type: "update",
        payload: {
          refs: {
            ...refs,
          },
        },
      });
    },
    [refs]
  );

  useEffect(() => {
    if (refs) {
      initRefs(refs);
    }
  }, []);

  useEffect(() => {
    if (props.constant) {
      constant = {
        ...constant,
        ...Object.assign(constant, props.constant),
      };
    }
  }, []);

  return initDebug({
    slopeRay,
    groundRay,
    constant,
    cameraRay,
    capsuleColliderRef: refs.capsuleColliderRef,
    rigidBodyRef: refs.rigidBodyRef,
    outerGroupRef: refs.outerGroupRef,
    slopeRayOriginRef: refs.slopeRayOriginRef,
    innerGroupRef: refs.innerGroupRef,
    keyControl,
    debug: props.debug,
  });
}

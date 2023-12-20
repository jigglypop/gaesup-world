import { useKeyboardControls } from "@react-three/drei";
import { vec3 } from "@react-three/rapier";
import { useCallback, useContext, useEffect, useMemo } from "react";
import * as THREE from "three";
import { groundRayType, refsType, slopeRayType } from "../../controller/type";

import { cameraRayType } from "../../camera/type";
import { update } from "../../utils/context";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";
import {
  gaesupWorldContextType,
  keyControlType,
} from "../../world/context/type";
import { gaesupControllerType } from "../context/type";

export default function initControllerProps({
  controllerContext,
  refs,
}: {
  controllerContext: gaesupControllerType;
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

  const cameraRay: cameraRayType = useMemo(() => {
    return {
      origin: vec3(),
      hit: new THREE.Raycaster(),
      rayCast: new THREE.Raycaster(vec3(), vec3(), 0, -7),
      dir: vec3(),
      position: vec3(),
      length: -controllerContext.cameraOption.maxDistance,
      detected: [],
      intersects: [],
      intersectObjectMap: {},
    };
  }, []);
  cameraRay.rayCast = new THREE.Raycaster(
    cameraRay.origin,
    cameraRay.dir,
    0,
    -controllerContext.cameraOption.maxDistance
  );

  const initRefs = useCallback(
    (refs: refsType) => {
      update<gaesupWorldContextType>(
        {
          refs: {
            ...refs,
          },
        },
        dispatch
      );
    },
    [refs]
  );

  useEffect(() => {
    if (refs) {
      initRefs(refs);
    }
  }, []);

  return {
    slopeRay,
    groundRay,
    cameraRay,
    keyControl,
  };
}

import { vec3 } from "@react-three/rapier";
import { useCallback, useContext, useEffect, useMemo } from "react";
import * as THREE from "three";
import { groundRayType, refsType } from "../type";

import { cameraRayType } from "../../camera/type";
import { update } from "../../utils/context";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";
import { gaesupWorldContextType } from "../../world/context/type";

export default function initControllerProps(props: { refs: refsType }) {
  const context = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  useEffect(() => {
    if (context && context.control) {
      // 컨트롤 정하기
      let newControl = {};
      if (context.mode.controller === "clicker") {
        if (context.mode.isButton) {
          newControl = { ...context.control };
        }
      } else {
        newControl = { ...context.control };
      }
      dispatch({
        type: "update",
        payload: {
          control: {
            ...newControl,
          },
        },
      });
    }
  }, [context?.mode.controller, context?.control]);

  const groundRay: groundRayType = useMemo(() => {
    return {
      origin: vec3(),
      dir: vec3({ x: 0, y: -1, z: 0 }),
      offset: vec3({ x: 0, y: -1, z: 0 }),
      hit: null,
      parent: null,
      rayCast: null,
      length: 10,
    };
  }, []);

  const cameraRay: cameraRayType = useMemo(() => {
    return {
      origin: vec3(),
      hit: new THREE.Raycaster(),
      rayCast: new THREE.Raycaster(vec3(), vec3(), 0, -7),
      dir: vec3(),
      position: vec3(),
      length: -context.cameraOption.maxDistance,
      detected: [],
      intersects: [],
      intersectObjectMap: {},
    };
  }, []);

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
    [props.refs]
  );

  useEffect(() => {
    if (props.refs) {
      initRefs(props.refs);
    }
  }, []);

  return {
    groundRay,
    cameraRay,
  };
}

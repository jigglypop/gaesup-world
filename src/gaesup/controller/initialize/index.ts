import { useKeyboardControls } from "@react-three/drei";
import { vec3 } from "@react-three/rapier";
import { useCallback, useContext, useEffect, useMemo } from "react";
import * as THREE from "three";
import { groundRayType, refsType } from "../../controller/type";

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

export default function initControllerProps({ refs }: { refs: refsType }) {
  const context = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const [_, getKeys] = useKeyboardControls();
  const keyControl: keyControlType = getKeys();

  useEffect(() => {
    if (context && keyControl && context.control) {
      // 컨트롤 정하기
      let newControl = {};
      if (context.mode.controller === "keyboard") {
        newControl = { ...keyControl };
      } else if (context.mode.controller === "clicker") {
        if (context.mode.isButton) {
          newControl = { ...context.control };
        } else {
          newControl = { ...keyControl };
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
  }, [context?.mode.controller, keyControl, context?.control]);

  const groundRay: groundRayType = useMemo(() => {
    return {
      origin: vec3(),
      dir: vec3({ x: 0, y: -1, z: 0 }),
      offset: vec3({ x: 0, y: -1, z: 0 }),
      hit: null,
      parent: null,
      rayCast: null,
      length: 0.5,
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

  const controllerOptions: {
    lerp: {
      cameraPosition: number;
      cameraTurn: number;
    };
  } = useMemo(() => {
    return {
      lerp: {
        cameraPosition: 0.9,
        cameraTurn: 0.1,
      },
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
    [refs]
  );

  useEffect(() => {
    if (refs) {
      initRefs(refs);
    }
  }, []);

  return {
    groundRay,
    cameraRay,
    keyControl,
    controllerOptions,
  };
}

import { vec3 } from '@react-three/rapier';
import { useAtom } from 'jotai';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { cameraOptionAtom } from '../../atoms/cameraOptionAtom';
import { cameraRayType } from '../../camera/type';
import { groundRayType, refsType } from '../../controller/type';
import { update } from '../../utils/context';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../../world/context';
import { gaesupWorldContextType } from '../../world/context/type';

export default function initControllerProps(props: { refs: refsType }) {
  const context = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const [cameraOption] = useAtom(cameraOptionAtom);
  const controlConfig = useMemo(() => {
    if (!context?.control) return null;
    if (context.mode.controller === 'clicker') {
      return context.mode.isButton ? { ...context.control } : {};
    } else {
      return { ...context.control };
    }
  }, [context?.mode.controller, context?.mode.isButton, context?.control]);
  useEffect(() => {
    if (controlConfig) {
      dispatch({
        type: 'update',
        payload: {
          control: controlConfig,
        },
      });
    }
  }, [controlConfig, dispatch]);
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
      length: -cameraOption.maxDistance,
      detected: [],
      intersects: [],
      intersectObjectMap: {},
    };
  }, [cameraOption.maxDistance]);

  const initRefs = useCallback(
    (refs: refsType) => {
      update<gaesupWorldContextType>(
        {
          refs: {
            ...refs,
          },
        },
        dispatch,
      );
    },
    [dispatch],
  );

  useEffect(() => {
    if (props.refs) {
      initRefs(props.refs);
    }
  }, [props.refs, initRefs]);

  return {
    groundRay,
    cameraRay,
  };
}

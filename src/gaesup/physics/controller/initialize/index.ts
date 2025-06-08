import { vec3 } from '@react-three/rapier';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { cameraOptionAtom } from '../../../atoms/cameraOptionAtom';
import { CameraRayType, GroundRayType, RefsType } from '../../../types';
import { useGaesupContext, useGaesupDispatch } from '../../../atoms';
import { gaesupWorldContextType } from '../../../atoms/types';
import { initControllerPropsType } from './types';

export default function initControllerProps(props: initControllerPropsType) {
  const context = useGaesupContext();
  const dispatch = useGaesupDispatch();
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
  const groundRay: GroundRayType = useMemo(() => {
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

  const cameraRay: CameraRayType = useMemo(() => {
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
    (refs: RefsType) => {
      dispatch({
        type: 'update',
        payload: {
          refs: {
            ...refs,
          },
        },
      });
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

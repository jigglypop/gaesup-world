import { useEffect, useMemo, useCallback, useRef } from 'react';
import { vec3 } from '@react-three/rapier';
import * as THREE from 'three';
import { useGaesupContext, useGaesupDispatch, useGaesupStore } from '../stores/gaesupStore';
import { CameraRayType, GroundRayType, RefsType } from '../types';

export function initControllerProps(props: { refs: RefsType }) {
  const context = useGaesupContext();
  const dispatch = useGaesupDispatch();
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const controlConfigSetRef = useRef(false);
  const refsSetRef = useRef(false);

  const controlConfig = useMemo(() => {
    if (!context?.control) return null;
    if (context.mode?.controller === 'clicker') {
      return context.mode.isButton ? { ...context.control } : {};
    } else {
      return { ...context.control };
    }
  }, [context?.mode?.controller, context?.mode?.isButton, context?.control]);

  useEffect(() => {
    if (controlConfig && !controlConfigSetRef.current) {
      dispatch({
        type: 'update',
        payload: { control: controlConfig },
      });
      controlConfigSetRef.current = true;
    }
  }, [controlConfig, dispatch]);

  const groundRay: GroundRayType = useMemo(
    () => ({
      origin: vec3(),
      dir: vec3({ x: 0, y: -1, z: 0 }),
      offset: vec3({ x: 0, y: -1, z: 0 }),
      hit: null,
      parent: null,
      rayCast: null,
      length: 10,
    }),
    [],
  );
  const cameraRay: CameraRayType = useMemo(
    () => ({
      origin: vec3(),
      hit: new THREE.Raycaster(),
      rayCast: new THREE.Raycaster(vec3(), vec3(), 0, -7),
      dir: vec3(),
      position: vec3(),
      length: -cameraOption.maxDistance,
      detected: [],
      intersects: [],
      intersectObjectMap: {},
    }),
    [cameraOption.maxDistance],
  );
  const initRefs = useCallback(
    (refs: RefsType) => {
      if (!refsSetRef.current) {
        dispatch({
          type: 'update',
          payload: { refs: { ...refs } },
        });
        refsSetRef.current = true;
      }
    },
    [dispatch],
  );
  useEffect(() => {
    if (props.refs && !refsSetRef.current) {
      initRefs(props.refs);
    }
  }, [props.refs, initRefs]);
  return { groundRay, cameraRay };
}

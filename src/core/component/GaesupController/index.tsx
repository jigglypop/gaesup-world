import { GaesupComponent } from '../GaesupComponent';
import { useMainFrameLoop } from '@hooks/useUnifiedFrame';
import { useKeyboard } from '@hooks/useKeyboard';
import { ControllerType } from './types';
import { useGaesupStore } from '@stores/gaesupStore';
import { useEffect } from 'react';

import * as THREE from 'three';
import { vec3 } from '@react-three/rapier';

export function GaesupController(props: ControllerType) {
  useMainFrameLoop();
  useKeyboard();

  const setControllerOptions = useGaesupStore((state) => state.setControllerOptions);

  useEffect(() => {
    if (props.controllerOptions) {
      setControllerOptions(props.controllerOptions);
    }
  }, [props.controllerOptions, setControllerOptions]);

  const controllerProps = {
    groundRay: {
      origin: vec3(),
      dir: vec3({ x: 0, y: -1, z: 0 }),
      offset: vec3({ x: 0, y: -1, z: 0 }),
      hit: null,
      parent: null,
      rayCast: null,
      length: 10,
    },
    cameraRay: {
      origin: vec3(),
      hit: new THREE.Raycaster(),
      rayCast: new THREE.Raycaster(vec3(), vec3(), 0, -7),
      dir: vec3(),
      position: vec3(),
      length: -50,
      detected: [],
      intersects: [],
      intersectObjectMap: {},
    },
    children: props.children,
    groupProps: props.groupProps || {},
    rigidBodyProps: props.rigidBodyProps || {},
    controllerOptions: props.controllerOptions,
    parts: props.parts || [],
    onReady: props.onReady || (() => {}),
    onFrame: props.onFrame || (() => {}),
    onDestory: props.onDestory || (() => {}),
    onAnimate: props.onAnimate || (() => {}),
  };

  return <GaesupComponent props={controllerProps} />;
}

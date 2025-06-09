'use client';
import { Collider } from '@dimforge/rapier3d-compat';
import { useContextBridge } from '@react-three/drei';
import { useSetAtom } from 'jotai';
import { RapierRigidBody } from '@react-three/rapier';
import { Suspense, useEffect, useRef, createContext, useContext } from 'react';
import * as THREE from 'three';
import { cameraOptionAtom } from '../../atoms';
import { GaesupProvider } from '../../atoms';
import { GaesupComponent } from '../../component';
import { GaesupContext } from '../../atoms';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useMainFrameLoop } from '../../hooks/useUnifiedFrame';
import { useGaesupGltf } from '../../utils/gltf';
import initGaesupWorld, { initControllerProps } from './initalize';
import { gaesupWorldPropsType, controllerType, controllerInnerType } from './types';

type UnifiedGaesupProps = gaesupWorldPropsType & Partial<controllerType>;

const ControllerContext = createContext<controllerType | null>(null);

function GaesupUnifiedController() {
  const controllerProps = useContext(ControllerContext);
  if (!controllerProps) return null;

  useMainFrameLoop();
  useKeyboard();
  const colliderRef = useRef<Collider>(null),
    rigidBodyRef = useRef<RapierRigidBody>(null),
    outerGroupRef = useRef<THREE.Group>(null),
    innerGroupRef = useRef<THREE.Group>(null),
    characterInnerRef = useRef<THREE.Group>(null),
    passiveRigidBodyRef = useRef<RapierRigidBody>(null);
  const refs = {
    colliderRef,
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    characterInnerRef,
    passiveRigidBodyRef,
  };
  const props: controllerInnerType = {
    ...initControllerProps({ refs }),
    children: controllerProps.children,
    groupProps: controllerProps.groupProps || {},
    rigidBodyProps: controllerProps.rigidBodyProps || {},
    controllerOptions: controllerProps.controllerOptions || {
      lerp: {
        cameraTurn: 1,
        cameraPosition: 1,
      },
    },
    parts: controllerProps.parts || [],
    onReady: controllerProps.onReady || (() => {}),
    onFrame: controllerProps.onFrame || (() => {}),
    onDestory: controllerProps.onDestory || (() => {}),
    onAnimate: controllerProps.onAnimate || (() => {}),
    ...refs,
  } as controllerInnerType;
  
  const ContextBridge = useContextBridge(GaesupContext);
  return (
    <ContextBridge>
      <GaesupComponent props={props} refs={refs} />
    </ContextBridge>
  );
}

export function GaesupController(props: controllerType) {
  return (
    <ControllerContext.Provider value={props}>
      <GaesupUnifiedController />
    </ControllerContext.Provider>
  );
}

export function GaesupWorld(props: UnifiedGaesupProps) {
  const { gaesupProps } = initGaesupWorld(props);
  const setCameraOption = useSetAtom(cameraOptionAtom);
  const { preloadSizes } = useGaesupGltf();
  
  const hasControllerProps = !!(
    props.groupProps || 
    props.rigidBodyProps || 
    props.controllerOptions || 
    props.parts ||
    props.onReady ||
    props.onFrame ||
    props.onDestory ||
    props.onAnimate
  );
  
  useEffect(() => {
    const urls = Object.values(props.urls || {}).filter(Boolean) as string[];
    if (urls.length > 0) {
      preloadSizes(urls);
    }
  }, [props.urls, preloadSizes]);
  
  useEffect(() => {
    if (props.cameraOption) {
      setCameraOption((prevOption) => ({
        ...prevOption,
        ...props.cameraOption,
      }));
    }
  }, [props.cameraOption, setCameraOption]);

  return (
    <GaesupProvider initialState={gaesupProps.value}>
      <Suspense fallback={null}>
        {hasControllerProps ? (
          <ControllerContext.Provider value={props as controllerType}>
            {props.children}
          </ControllerContext.Provider>
        ) : (
          props.children
        )}
      </Suspense>
    </GaesupProvider>
  );
}

'use client';
import { Collider } from '@dimforge/rapier3d-compat';
import { useContextBridge } from '@react-three/drei';
import { vec3 } from '@react-three/rapier';
import { useAtom, useSetAtom } from 'jotai';
import { RapierRigidBody } from '@react-three/rapier';
import {
  Suspense,
  useEffect,
  useRef,
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
} from 'react';
import * as THREE from 'three';
import { cameraOptionAtom } from '../../atoms/cameraOptionAtom';
import {
  GaesupProvider,
  useGaesupContext,
  useGaesupDispatch,
  gaesupWorldDefault,
  gaesupWorldReducer,
} from '../../atoms';
import { GaesupComponent } from '../../component';
import { GaesupContext } from '../../atoms';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useMainFrameLoop } from '../../hooks/useUnifiedFrame';
import { useGaesupGltf } from '../../utils/gltf';
import { CameraRayType, GroundRayType, RefsType } from '../../types';
import {
  gaesupWorldPropsType,
  controllerType,
  controllerInnerType,
  componentTypeString,
} from './types';

type UnifiedGaesupProps = gaesupWorldPropsType & Partial<controllerType>;

const ControllerContext = createContext<controllerType | null>(null);

function initGaesupWorld(props: gaesupWorldPropsType) {
  const initialState = useMemo(
    () => ({
      activeState: {
        ...gaesupWorldDefault.activeState,
        position: props.startPosition || gaesupWorldDefault.activeState.position,
      },
      mode: { ...gaesupWorldDefault.mode, ...(props.mode || {}) },
      urls: { ...gaesupWorldDefault.urls, ...(props.urls || {}) },
      refs: null,
      states: gaesupWorldDefault.states,
      rideable: gaesupWorldDefault.rideable || {},
      control: gaesupWorldDefault.control,
      clicker: gaesupWorldDefault.clicker,
      clickerOption: { ...gaesupWorldDefault.clickerOption, ...(props.clickerOption || {}) },
      animationState: gaesupWorldDefault.animationState,
      block: { ...gaesupWorldDefault.block, ...(props.block || {}) },
      sizes: gaesupWorldDefault.sizes,
    }),
    [props.startPosition, props.mode, props.urls, props.clickerOption, props.block],
  );

  const [value, dispatch] = useReducer(gaesupWorldReducer, initialState);
  const gaesupProps = useMemo(() => ({ value, dispatch }), [value, dispatch]);
  return { gaesupProps };
}

function initControllerProps(props: { refs: RefsType }) {
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
        payload: { control: controlConfig },
      });
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
      dispatch({
        type: 'update',
        payload: { refs: { ...refs } },
      });
    },
    [dispatch],
  );

  useEffect(() => {
    if (props.refs) {
      initRefs(props.refs);
    }
  }, [props.refs, initRefs]);

  return { groundRay, cameraRay };
}

export function initCallback({
  props,
  actions,
  componentType,
}: {
  props: any;
  actions: any;
  componentType: componentTypeString;
}) {
  if (props.onReady) props.onReady();
  if (props.onFrame) props.onFrame();
  if (props.onAnimate && actions) props.onAnimate();
}

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
      lerp: { cameraTurn: 1, cameraPosition: 1 },
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

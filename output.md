# 코드 추출 결과

## TypeScript Files (.ts)

### index.ts

```typescript
export { GaesupComponent } from "./gaesup/component";
export { PassiveAirplane } from "./gaesup/component/passive/airplane";
export { PassiveCharacter } from "./gaesup/component/passive/character";
export { PassiveVehicle } from "./gaesup/component/passive/vehicle";

export { GaesupController } from "./gaesup/controller";
export { GaeSupProps } from "./gaesup/gaesupProps";
export { Clicker } from "./gaesup/tools/clicker";
export { GamePad } from "./gaesup/tools/gamepad";
export { MiniMap } from "./gaesup/tools/minimap";
export { Rideable } from "./gaesup/tools/rideable";
export { teleport } from "./gaesup/tools/teleport";
export { InnerHtml } from "./gaesup/utils/innerHtml";
export { Elr, Qt, V3, V30, V31 } from "./gaesup/utils/vector";
export { GaesupWorld } from "./gaesup/world";

export { useClicker } from "./gaesup/hooks/useClicker";
export { useGaesupAnimation } from "./gaesup/hooks/useGaesupAnimation";
export { useGaesupController } from "./gaesup/hooks/useGaesupController";
export { useMovePoint } from "./gaesup/hooks/useMovePoint";
export { usePushKey } from "./gaesup/hooks/usePushKey";
export { useRideable } from "./gaesup/hooks/useRideable";
export { useTeleport } from "./gaesup/hooks/useTeleport";
export { useZoom } from "./gaesup/hooks/useZoom";

```

### gaesup\animation\actions.ts

```typescript
import { useFrame } from '@react-three/fiber';
import { useContext, useEffect } from 'react';
import { animationTagType } from '../controller/type';
import { useGaesupAnimation } from '../hooks/useGaesupAnimation';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../world/context';
import { playActionsType, subscribeActionsType } from './type';

export function subscribeActions({ type }: subscribeActionsType) {
  const { states } = useContext(GaesupWorldContext);
  const { subscribeAll } = useGaesupAnimation({ type });
  // 초기 기본 애니메이션 등록
  useEffect(() => {
    subscribeAll([
      {
        tag: 'walk',
        condition: () => !states.isRunning && states.isMoving,
        action: () => {},
        animationName: 'walk',
        key: 'walk',
      },
      {
        tag: 'run',
        condition: () => states.isRunning,
        action: () => {},
        animationName: 'run',
        key: 'run',
      },
      {
        tag: 'jump',
        condition: () => states.isJumping,
        action: () => {},
        animationName: 'jump',
        key: 'jump',
      },

      {
        tag: 'ride',
        condition: () => states.isPush['keyR'],
        action: () => {},
        animationName: 'ride',
        key: 'ride',
      },
      {
        tag: 'land',
        condition: () => states.isLanding,
        action: () => {},
        animationName: 'land',
        key: 'land',
      },
      {
        tag: 'fall',
        condition: () => states.isFalling,
        action: () => {},
        animationName: 'fall',
        key: 'fall',
      },
    ]);
  }, []);
}

export default function playActions({
  type,
  actions,
  animationRef,
  currentAnimation,
  isActive,
}: playActionsType) {
  const { mode, animationState, block } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { notify, store } = useGaesupAnimation({ type });

  if (isActive) {
    currentAnimation = animationState?.[type]?.current;
  }

  const play = (tag: keyof animationTagType) => {
    animationState[type].current = tag;
    const currentAnimation = store[tag];
    if (currentAnimation?.action) {
      currentAnimation.action();
    }
    dispatch({
      type: 'update',
      payload: {
        animationState: {
          ...animationState,
        },
      },
    });
  };

  useEffect(() => {
    let animation = 'idle';
    if (block.animation) {
      animation = 'idle';
    } else if (currentAnimation) {
      animation = currentAnimation;
    } else if (animationState[type].current) {
      animation = animationState[type].current;
    }
    const action = actions[animation]?.reset().fadeIn(0.2).play();
    return () => {
      action?.fadeOut(0.2);
    };
  }, [currentAnimation, mode.type, block.animation, type]);

  useFrame(() => {
    if (isActive) {
      const tag = notify() as keyof animationTagType;
      play(tag);
    }
  });

  return {
    animationRef,
    currentAnimation: animationState?.[type]?.current,
  };
}

```

### gaesup\animation\type.ts

```typescript
import { Ref } from "react";
import * as THREE from "three";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Object3D,
  Object3DEventMap,
} from "three";
import { groundRayType } from "../controller/type";

export type Api<T extends AnimationClip> = {
  ref: React.MutableRefObject<Object3D | undefined | null>;
  clips: AnimationClip[];
  mixer: AnimationMixer;
  names: T["name"][];
  actions: {
    [key in T["name"]]: AnimationAction | null;
  };
};

export type playActionsType = {
  type: "character" | "vehicle" | "airplane";
  currentAnimation?: string;
  actions: actionsType;
  animationRef: Ref<Object3D<Object3DEventMap>>;
  isActive: boolean;
};

export type subscribeActionsType = {
  type: "character" | "vehicle" | "airplane";
  groundRay: groundRayType;
  animations: AnimationClip[];
};

export type actionsType = {
  [x: string]: THREE.AnimationAction | null;
};

export type playResultType = {
  actions: actionsType;
  ref: Ref<Object3D<Object3DEventMap>>;
};

```

### gaesup\atoms\blockAtom.ts

```typescript

```

### gaesup\atoms\cameraOptionAtom.ts

```typescript
// src/gaesup/atoms/cameraOptionAtom.ts
import { atom } from 'jotai';
import * as THREE from 'three';

export interface CameraOption {
  offset: THREE.Vector3;
  zoom: number;
  maxDistance: number;
}

export const cameraOptionAtom = atom<CameraOption>({
  offset: new THREE.Vector3(-10, -10, -10),
  zoom: 1,
  maxDistance: -7,
});

```

### gaesup\camera\type.ts

```typescript
import * as THREE from 'three';
import {} from 'three-stdlib';

export type cameraRayType = {
  origin: THREE.Vector3;
  hit: THREE.Raycaster;
  rayCast: THREE.Raycaster | null;
  length: number;
  dir: THREE.Vector3;
  position: THREE.Vector3;
  intersects: THREE.Intersection<THREE.Mesh>[];
  detected: THREE.Intersection<THREE.Mesh>[];
  intersectObjectMap: { [uuid: string]: THREE.Mesh };
};

```

### gaesup\camera\control\normal.ts

```typescript
import { cameraPropType } from "../../physics/type";
import { V3 } from "../../utils/vector";
import { activeStateType, cameraOptionType } from "../../world/context/type";

export const makeNormalCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType
) => {
  const { XDistance, YDistance, ZDistance } = cameraOption;
  const cameraPosition = activeState.position
    .clone()
    .add(V3(XDistance, YDistance, ZDistance));
  return cameraPosition;
};
export default function normal(prop: cameraPropType) {
  const {
    state,
    worldContext: { cameraOption },
    controllerOptions: { lerp },
  } = prop;
  if (!state || !state.camera) return;
  state.camera.position.lerp(
    cameraOption.position.clone(),
    lerp.cameraPosition
  );
  state.camera.lookAt(cameraOption.target);
}

```

### gaesup\camera\control\orbit.ts

```typescript
import { quat } from '@react-three/rapier';
import { cameraPropType } from '../../physics/type';
import { V3 } from '../../utils/vector';
import { activeStateType, cameraOptionType } from '../../world/context/type';

export const makeOrbitCameraPosition = (
  activeState: activeStateType,
  cameraOption: cameraOptionType,
) => {
  const { XDistance, YDistance, ZDistance } = cameraOption;
  const cameraPosition = activeState.position.clone().add(
    V3(Math.sin(activeState.euler.y), 1, Math.cos(activeState.euler.y))
      .normalize()
      .clone()
      .multiply(V3(-XDistance, YDistance, -ZDistance)),
  );
  return cameraPosition;
};

export default function orbit(prop: cameraPropType) {
  const {
    state,
    worldContext: { activeState, cameraOption },
    controllerOptions: { lerp },
  } = prop;
  if (!state || !state.camera) return;
  const cameraPosition = makeOrbitCameraPosition(activeState, cameraOption);
  state.camera.position.lerp(cameraPosition.clone(), lerp.cameraTurn);
  state.camera.quaternion.copy(
    activeState.quat.clone().multiply(quat().setFromAxisAngle(V3(0, 1, 0), Math.PI)),
  );
  state.camera.rotation.copy(activeState.euler);
  state.camera.lookAt(activeState.position.clone());
}

```

### gaesup\component\type.ts

```typescript
import { ObjectMap } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import { RefObject } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

export type GLTFResult = GLTF & {
  nodes: { [name: string]: THREE.Mesh | THREE.SkinnedMesh };
  materials: { [name: string]: THREE.Material | THREE.MeshStandardMaterial };
} & ObjectMap;

export type passiveRefsType = {
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
};

```

### gaesup\component\active\airplane\type.ts

```typescript
import { passiveAirplanePropsType } from "../../passive/airplane/type";
import { innerRefType } from "../../passive/type";

export type activeAirplaneInnerType = passiveAirplanePropsType & innerRefType;

```

### gaesup\component\active\character\type.ts

```typescript
import { RigidBodyTypeString } from "@react-three/rapier";
import * as THREE from "three";
import { controllerOptionsType } from "../../../controller/type";

export type activeCharacterPropsType = {
  characterUrl: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  controllerOptions?: controllerOptionsType;
  currentAnimation?: string;
  children?: React.ReactNode;
  rigidbodyType?: RigidBodyTypeString;
};

```

### gaesup\component\active\vehicle\type.ts

```typescript
import { innerRefType } from "../../passive/type";
import { passiveVehiclePropsType } from "../../passive/vehicle/type";

export type activeVehicleInnerType = passiveVehiclePropsType & innerRefType;

```

### gaesup\component\inner\airplane\type.ts

```typescript
import { ridingType, rigidBodyRefType } from "../common/type";

// airplane 타입 정의
export type airplaneUrlType = {
  wheelUrl?: string;
};

export type airplaneInnerType = rigidBodyRefType & ridingType & airplaneUrlType;

```

### gaesup\component\inner\character\type.ts

```typescript
import { callbackType } from "../../../controller/initialize/callback/type";
import { groundRayType, partsType } from "../../../controller/type";
import { passiveCharacterPropsType } from "../../passive/character/type";
import { componentTypeString, innerRefType } from "../../passive/type";

// 내부 정의
export type characterInnerType = {
  componentType: componentTypeString;
  isActive?: boolean;
  groundRay: groundRayType;
  parts?: partsType;
} & passiveCharacterPropsType &
  innerRefType &
  callbackType;

```

### gaesup\component\inner\common\calc.ts

```typescript
import * as THREE from "three";

export const calcCharacterColliderProps = (characterSize: THREE.Vector3) => {
  if (!characterSize) return null;
  const heightPlusDiameter = characterSize.y / 2;
  const diameter = Math.max(characterSize.x, characterSize.z);
  const radius = diameter / 2;
  const height = heightPlusDiameter - radius;
  const halfHeight = height / 2;
  return {
    height,
    halfHeight,
    radius,
    diameter,
  };
};

```

### gaesup\component\inner\common\setGroundRay.ts

```typescript
import { useRapier } from '@react-three/rapier';
import { useRayHit } from '../../../hooks/useRayHit';
import { setGroundRayType } from './type';

export function useSetGroundRay() {
  const { rapier } = useRapier();
  const getRayHit = useRayHit();
  const setGroundRay = ({ groundRay, length, colliderRef }: setGroundRayType) => {
    groundRay.length = length;
    groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
    groundRay.hit = getRayHit({
      ray: groundRay,
      ref: colliderRef,
    });
    groundRay.parent = groundRay.hit?.collider.parent();
  };
  return setGroundRay;
}

```

### gaesup\component\inner\common\type.ts

```typescript
import { Collider } from "@dimforge/rapier3d-compat";
import { RigidBodyProps, RigidBodyTypeString } from "@react-three/rapier";
import { MutableRefObject, RefObject } from "react";
import * as THREE from "three";
import { callbackType } from "../../../controller/initialize/callback/type";
import { groundRayType, partsType } from "../../../controller/type";
import { urlsType } from "../../../world/context/type";
import { innerRefType, passivePropsType } from "../../passive/type";
// collider 정의
export type characterColliderType = {
  height: number;
  halfHeight: number;
  radius: number;
  diameter: number;
};
// innerGroupRef 타입정의
export type InnerGroupRefType = {
  children?: React.ReactNode;
  objectNode: THREE.Object3D;
  animationRef: MutableRefObject<THREE.Object3D<THREE.Object3DEventMap>>;
  nodes: {
    [name: string]: THREE.Object3D<THREE.Object3DEventMap>;
  };
  isActive?: boolean;
  ridingUrl?: string;
  offset?: THREE.Vector3;
  parts?: partsType;
} & ridingType;
// riding 타입정의
export type ridingType = {
  isRiderOn?: boolean;
  enableRiding?: boolean;
};

export type refPropsType = {
  children: React.ReactNode;
  urls: urlsType;
  isRiderOn?: boolean;
  enableRiding?: boolean;
  offset?: THREE.Vector3;
  name?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  userData?: { intangible: boolean };
  currentAnimation?: string;
  type?: RigidBodyTypeString;
};

export type setGroundRayType = {
  groundRay: groundRayType;
  length: number;
  colliderRef: RefObject<Collider>;
};

export type rigidBodyRefType = {
  name?: string;
  userData?: { intangible: boolean };
  isActive?: boolean;
  ridingUrl?: string;
  groundRay?: groundRayType;
  rigidBodyProps?: RigidBodyProps;
  isNotColliding?: boolean;
  parts?: partsType;
} & passivePropsType &
  innerRefType &
  callbackType;

```

### gaesup\component\inner\common\useGenericRefs.ts

```typescript
import { MutableRefObject, useRef } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { Collider } from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

export type GenericRefsType = {
  rigidBodyRef: MutableRefObject<RapierRigidBody | null>;
  outerGroupRef: MutableRefObject<THREE.Group | null>;
  innerGroupRef: MutableRefObject<THREE.Group | null>;
  colliderRef: MutableRefObject<Collider | null>;
};

export function useGenericRefs(): GenericRefsType {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const colliderRef = useRef<Collider>(null);
  return { rigidBodyRef, outerGroupRef, innerGroupRef, colliderRef };
}

```

### gaesup\component\inner\vehicle\type.ts

```typescript
import { ridingType, rigidBodyRefType } from "../common/type";

// vehicle 타입 정의
export type vehicleUrlType = {
  wheelUrl?: string;
};

export type vehicleInnerType = rigidBodyRefType & ridingType & vehicleUrlType;

```

### gaesup\component\passive\type.ts

```typescript
import { Collider } from "@dimforge/rapier3d-compat";
import {
  CollisionEnterPayload,
  RapierRigidBody,
  RigidBodyProps,
  RigidBodyTypeString,
} from "@react-three/rapier";
import { MutableRefObject } from "react";
import * as THREE from "three";
import {
  controllerOptionsType,
  groundRayType,
  partsType,
} from "../../controller/type";
import { ridingType } from "../inner/common/type";

// 컴포넌트 종류
export type componentTypeString = "character" | "vehicle" | "airplane";
// 내부 컴포넌트 종류
export type innerRefType = {
  colliderRef: MutableRefObject<Collider>;
  rigidBodyRef: MutableRefObject<RapierRigidBody>;
  outerGroupRef: MutableRefObject<THREE.Group>;
  innerGroupRef: MutableRefObject<THREE.Group>;
};
// passive 오브젝트 타입정의
export type passivePropsType = {
  children?: React.ReactNode;
  groundRay?: groundRayType;
  url: string;
  ridingUrl?: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  offset?: THREE.Vector3;
  controllerOptions?: controllerOptionsType;
  currentAnimation?: string;
  rigidbodyType?: RigidBodyTypeString;
  sensor?: boolean;
  onIntersectionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  componentType: componentTypeString;
  userData?: {
    intangible: boolean;
  };
  rigidBodyProps?: RigidBodyProps;
  outerGroupProps?: THREE.Group;
  innerGroupProps?: THREE.Group;
  parts?: partsType;
  isNotColliding?: boolean;
} & ridingType;

```

### gaesup\component\passive\airplane\type.ts

```typescript
import { passivePropsType } from "../type";

export type passiveAirplanePropsType = Omit<passivePropsType, "componentType">;

```

### gaesup\component\passive\character\type.ts

```typescript
import { passivePropsType } from '../type';

export type passiveCharacterPropsType = Omit<
  passivePropsType,
  'isRiding' | 'enableRiding' | 'componentType'
>;

```

### gaesup\component\passive\vehicle\type.ts

```typescript
import { passivePropsType } from "../type";

export type passiveVehiclePropsType = Omit<passivePropsType, "componentType">;

```

### gaesup\controller\type.ts

```typescript
import { Collider, Ray } from "@dimforge/rapier3d-compat";
import { GroupProps } from "@react-three/fiber";
import { RapierRigidBody, RigidBodyProps } from "@react-three/rapier";
import { ReactNode, RefObject } from "react";
import * as THREE from "three";
import { cameraRayType } from "../camera/type";
import { urlsType } from "../world/context/type";
import { airplaneType, characterType, vehicleType } from "./context/type";
import { callbackType } from "./initialize/callback/type";

export type optionsType = {
  debug: boolean;
  mode?: "normal" | "vehicle" | "airplane";
  controllerType: "none";
  cameraCollisionType: "transparent" | "closeUp";
  camera: {
    type: "perspective" | "orthographic";
    control: "orbit" | "normal";
  };
  minimap: boolean;
  minimapRatio: number;
};

export type partialOptionsType = Partial<optionsType>;

export type jumpInnerType = {
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
};

export type jumpConstType = {
  speed: number;
  gravity: number;
};

export type jumpPropType = jumpInnerType & jumpConstType;

export type rayType = {
  origin: THREE.Vector3;
  hit: any | null;
  rayCast: Ray | null;
  dir: THREE.Vector3;
  offset: THREE.Vector3;
  length: number;
  current?: THREE.Vector3;
  angle?: number;
  parent?: RapierRigidBody | null | undefined;
};

export type slopeRayType = Omit<rayType, "parent">;
export type groundRayType = Omit<rayType, "current" | "angle">;
// ref 전환
export type controllerOptionsType = {
  lerp: {
    cameraTurn: number;
    cameraPosition: number;
  };
};

export type controllerInnerType = {
  name?: string;
  groundRay: groundRayType;
  cameraRay: cameraRayType;
  controllerOptions: controllerOptionsType;
  parts?: partsType;
} & controllerOtherPropType &
  refsType &
  callbackType;

export type animationTagType = {
  idle: string;
  walk: string;
  run: string;
  jump: string;
  jumpIdle: string;
  jumpLand: string;
  fall: string;
  ride: string;
  land: string;
  sit: string;
};

export type actionsType = animationTagType & {
  [key: string]: string;
};

export type refsType = {
  colliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
  characterInnerRef: RefObject<THREE.Group>;
};

// context로 넘어가는 타입
export type gaesupControllerContextPropType = {
  airplane: airplaneType;
  vehicle: vehicleType;
  character: characterType;
  controllerOptions: controllerOptionsType;
};

// 나머지 controller 타입
export interface controllerOtherPropType extends RigidBodyProps {
  children?: ReactNode;
  groupProps?: GroupProps;
  rigidBodyProps?: RigidBodyProps;
  debug?: boolean;
}

// 파츠
export type partType = {
  url?: string | undefined;
  color?: string | undefined;
  position?: THREE.Vector3 | undefined;
  rotation?: THREE.Euler | undefined;
  scale?: THREE.Vector3 | undefined;
};
export type partsType = partType[];

export type controllerType = controllerOtherPropType &
  urlsType &
  Partial<gaesupControllerContextPropType> &
  callbackType & {
    controllerOptions?: controllerOptionsType;
    parts?: partsType;
  };

```

### gaesup\controller\context\index.ts

```typescript
import { createContext } from 'react';
import { dispatchType } from '../../utils/type';
import { V3 } from '../../utils/vector';
import { gaesupControllerType } from './type';

export const gaesupControllerDefault = {
  airplane: {
    angleDelta: V3(Math.PI / 256, Math.PI / 256, Math.PI / 256),
    maxAngle: V3(Math.PI / 8, Math.PI / 8, Math.PI / 8),
    maxSpeed: 60,
    accelRatio: 2,
    brakeRatio: 5,
    buoyancy: 0.2,
    linearDamping: 1,
  },
  vehicle: {
    maxSpeed: 60,
    accelRatio: 2,
    brakeRatio: 5,
    wheelOffset: 0.1,
    linearDamping: 0.5,
  },
  character: {
    walkSpeed: 10,
    runSpeed: 20,
    turnSpeed: 10,
    jumpSpeed: 1,
    linearDamping: 1,
  },
  callbacks: {
    onReady: () => {},
    onFrame: () => {},
    onDestory: () => {},
    onAnimate: () => {},
  },
  refs: {
    colliderRef: null,
    rigidBodyRef: null,
    outerGroupRef: null,
    innerGroupRef: null,
    characterInnerRef: null,
  },
  controllerOptions: {
    lerp: {
      cameraTurn: 1,
      cameraPosition: 1,
    },
  },
};

export const GaesupControllerContext = createContext<gaesupControllerType>({
  ...gaesupControllerDefault,
});
export const GaesupControllerDispatchContext =
  createContext<dispatchType<gaesupControllerType>>(null);

```

### gaesup\controller\context\reducer.ts

```typescript
import { gaesupControllerType } from './type';

export function gaesupControllerReducer(
  props: gaesupControllerType,
  action: {
    type: string;
    payload?: Partial<gaesupControllerType>;
  },
) {
  switch (action.type) {
    case 'init': {
      return { ...props };
    }
    case 'update': {
      return { ...props, ...action.payload };
    }
  }
}

```

### gaesup\controller\context\type.ts

```typescript
import { GroupProps } from '@react-three/fiber';
import * as THREE from 'three';
import { dispatchType } from '../../utils/type';
import { callbackType } from '../initialize/callback/type';
import { gaesupControllerContextPropType, refsType } from '../type';

export type airplaneDebugType = {
  angleDelta?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  buoyancy?: number;
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  linearDamping?: number;
};

export type vehicleDebugType = {
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  wheelOffset?: number;
  linearDamping?: number;
};

export type characterDebugType = {
  jumpSpeed?: number;
  turnSpeed?: number;
  walkSpeed?: number;
  runSpeed?: number;
  linearDamping?: number;
};

export interface airplaneType extends GroupProps, airplaneDebugType {}
export interface vehicleType extends GroupProps, vehicleDebugType {}
export interface characterType extends GroupProps, characterDebugType {}

export type gaesupControllerType = gaesupControllerContextPropType & {
  callbacks?: callbackType;
  refs?: refsType;
};

export type gaesupDisptachType = dispatchType<gaesupControllerType>;

```

### gaesup\controller\initialize\index.ts

```typescript
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

```

### gaesup\controller\initialize\callback\index.ts

```typescript
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect } from "react";
import { AnimationAction } from "three";
import { rigidBodyRefType } from "../../../component/inner/common/type";
import { componentTypeString } from "../../../component/passive/type";
import { useGaesupAnimation } from "../../../hooks/useGaesupAnimation";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../../world/context";
import { animationTagType } from "../../type";
import { callbackPropType } from "./type";

export default function initCallback({
  props,
  actions,
  componentType,
}: {
  props: rigidBodyRefType;
  actions: {
    [x: string]: AnimationAction;
  };
  componentType: componentTypeString;
}) {
  const { animationState } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { store } = useGaesupAnimation({ type: componentType });
  const { activeState, states, control } = useContext(GaesupWorldContext);
  const { subscribe } = useGaesupAnimation({ type: componentType });

  const playAnimation = (tag: keyof animationTagType, key: string) => {
    if (!(key in control)) return;
    if (control[key] && animationState[componentType]) {
      animationState[componentType].current = tag;
      const currentAnimation = store[tag];
      if (currentAnimation?.action) {
        currentAnimation.action();
      }
      dispatch({
        type: "update",
        payload: {
          animationState: {
            ...animationState,
          },
        },
      });
    }
  };

  const controllerProp: callbackPropType = {
    activeState,
    control,
    states,
    subscribe,
  };

  useEffect(() => {
    if (props.onReady) {
      props.onReady(controllerProp);
    }
    return () => {
      if (props.onDestory) {
        props.onDestory(controllerProp);
      }
    };
  }, []);

  useFrame((prop) => {
    if (props.onFrame) {
      props.onFrame({ ...controllerProp, ...prop });
    }
    if (props.onAnimate) {
      props.onAnimate({
        ...controllerProp,
        ...prop,
        actions,
        animationState,
        playAnimation,
      });
    }
  });

  return {
    subscribe,
    playAnimation,
    dispatch,
  };
}

```

### gaesup\controller\initialize\callback\type.ts

```typescript
import { RootState } from "@react-three/fiber";
import * as THREE from "three";
import {
  activeStateType,
  animationAtomType,
  animationStateType,
  keyControlType,
  statesType,
} from "../../../world/context/type";
import { actionsType } from "../../type";

export type callbackPropType = {
  activeState: activeStateType;
  states: statesType;
  // groundRay: groundRayType;
  // cameraRay: cameraRayType;
  control: keyControlType;
  subscribe: (props: animationAtomType) => void;
};

export type onFramePropType = callbackPropType & RootState;
export type onAnimatePropType = onFramePropType & {
  actions: {
    [x: string]: THREE.AnimationAction | null;
  };
  animationState: animationStateType;
  playAnimation: (tag: keyof actionsType, key: string) => void;
};

export type callbackType = {
  onReady?: (prop: callbackPropType) => void;
  onFrame?: (prop: onFramePropType) => void;
  onDestory?: (prop: callbackPropType) => void;
  onAnimate?: (prop: onAnimatePropType) => void;
};

```

### gaesup\hooks\useClicker\index.ts

```typescript
import { ThreeEvent } from '@react-three/fiber';
import { useContext } from 'react';
import { V3 } from '../../utils';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../../world/context';

export function useClicker() {
  const { activeState, mode } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const moveClicker = (e: ThreeEvent<MouseEvent>, isRun: boolean, type: 'normal' | 'ground') => {
    if (mode.controller !== 'clicker' || type !== 'ground') return;
    const u = activeState.position;
    const v = V3(e.point.x, e.point.y, e.point.z);
    const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
    dispatch({
      type: 'update',
      payload: {
        clicker: {
          point: V3(v.x, 0, v.z),
          angle: newAngle,
          isOn: true,
          isRun: isRun,
        },
      },
    });
  };

  return {
    moveClicker,
  };
}

```

### gaesup\hooks\useGaesupController\index.ts

```typescript
// "Please use this only as a subcomponent of GaesupWorld."

import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
import { activeStateType, modeType, urlsType } from "../../world/context/type";

export function useGaesupController(): gaesupPassivePropsType {
  const worldContext = useContext(GaesupWorldContext);
  return {
    state: worldContext.activeState,
    mode: worldContext.mode,
    urls: worldContext.urls,
    currentAnimation: worldContext.mode.type
      ? worldContext.animationState[worldContext.mode.type].current
      : "idle",
  };
}

export type gaesupPassivePropsType = {
  state: activeStateType;
  mode: modeType;
  urls: urlsType;
  currentAnimation: string;
  children?: React.ReactNode;
};

```

### gaesup\hooks\useMovePoint\index.ts

```typescript
import { vec3 } from "@react-three/rapier";
import { useContext } from "react";
import * as THREE from "three";
import { V3 } from "../../utils";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";

export function useMovePoint() {
  const { activeState, clicker } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const move = (position: THREE.Vector3, isRun: boolean) => {
    const u = activeState.position;
    const v = vec3(position);
    const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
    dispatch({
      type: "update",
      payload: {
        clicker: {
          point: V3(position.x, 0, position.z),
          angle: newAngle,
          isOn: true,
          isRun: isRun,
        },
      },
    });
  };

  return {
    move,
  };
}

```

### gaesup\hooks\usePushKey\index.ts

```typescript
import { useContext } from "react";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";

export function usePushKey() {
  const { control } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const pushKey = (key: string, value: boolean) => {
    control[key] = value;
    dispatch({
      type: "update",
      payload: {
        control: {
          ...control,
        },
      },
    });
  };

  return {
    pushKey,
  };
}

```

### gaesup\hooks\useRayHit\index.ts

```typescript
import { Collider } from "@dimforge/rapier3d-compat";
import { useRapier } from "@react-three/rapier";
import { RefObject, useCallback } from "react";
import { groundRayType } from "../../controller/type";

export function useRayHit() {
  const rapier = useRapier();

  const getRayHit = useCallback(
    ({ ray, ref }: { ray: groundRayType; ref: RefObject<Collider> }) => {
      return rapier.world.castRay(
        ray.rayCast,
        ray.length,
        true,
        undefined,
        undefined,
        ref.current as any,
        undefined
      );
    },
    [rapier]
  );

  return getRayHit;
}

```

### gaesup\hooks\useRideable\type.ts

```typescript
import * as THREE from "three";

export type rideableType = {
  objectkey: string;
  objectType?: "vehicle" | "airplane";
  enableRiding?: boolean;
  isRiderOn?: boolean;
  url?: string;
  characterUrl?: string;
  ridingUrl?: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  offset?: THREE.Vector3;
  landingOffset?: THREE.Vector3;
  visible?: boolean;
  vehicleSize?: THREE.Vector3;
  wheelSize?: THREE.Vector3;
  airplaneSize?: THREE.Vector3;
};

```

### gaesup\physics\index.ts

```typescript
import { useFrame } from '@react-three/fiber';
import { useContext, useEffect } from 'react';
import { GaesupControllerContext } from '../controller/context';
import { useGaesupGltf } from '../hooks/useGaesupGltf';
import { V3 } from '../utils';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../world/context';
import airplaneCalculation from './airplane';
import characterCalculation from './character';
import check from './check';
import { calcType } from './type';
import vehicleCalculation from './vehicle';

export default function calculation({
  groundRay,
  rigidBodyRef,
  outerGroupRef,
  innerGroupRef,
  colliderRef,
}) {
  const worldContext = useContext(GaesupWorldContext);
  const controllerContext = useContext(GaesupControllerContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { mode, activeState, block } = worldContext;
  const { getSizesByUrls } = useGaesupGltf();
  useEffect(() => {
    if (!rigidBodyRef || !innerGroupRef) return;
    if (rigidBodyRef.current && innerGroupRef.current) {
      rigidBodyRef.current.lockRotations(false, true);
      activeState.euler.set(0, 0, 0);
      rigidBodyRef.current.setTranslation(activeState.position.clone().add(V3(0, 5, 0)), true);
    }
  }, [mode.type]);

  useEffect(() => {
    if (rigidBodyRef && rigidBodyRef.current) {
      if (block.control) {
        rigidBodyRef.current.resetForces(false);
        rigidBodyRef.current.resetTorques(false);
      }
    }
  }, [block.control, rigidBodyRef.current]);

  useFrame((state, delta) => {
    if (
      !rigidBodyRef ||
      !rigidBodyRef.current ||
      !outerGroupRef ||
      !outerGroupRef.current ||
      !innerGroupRef ||
      !innerGroupRef.current
    )
      return null;
    if (block.control) {
      return null;
    }
    const calcProp: calcType = {
      rigidBodyRef,
      outerGroupRef,
      innerGroupRef,
      colliderRef,
      groundRay,
      state,
      delta,
      worldContext,
      controllerContext,
      dispatch,
      matchSizes: getSizesByUrls(worldContext?.urls),
    };
    if (mode.type === 'vehicle') vehicleCalculation(calcProp);
    else if (mode.type === 'character') characterCalculation(calcProp);
    else if (mode.type === 'airplane') airplaneCalculation(calcProp);
    check(calcProp);
  });
}

```

### gaesup\physics\type.ts

```typescript
import { RootState } from "@react-three/fiber";

import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { RefObject } from "react";
import * as THREE from "three";
import { gaesupControllerType } from "../controller/context/type";
import {
  controllerOptionsType,
  groundRayType,
  refsType,
} from "../controller/type";
import { dispatchType } from "../utils/type";
import { gaesupWorldContextType, urlsType } from "../world/context/type";

export type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;

export type hidratePropType = {
  position: THREE.Vector3;
  euler: THREE.Euler;
} & Partial<refsType>;

export type propInnerType = {
  colliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
};

export type calcPropType = propInnerType & {
  state?: RootState;
  worldContext?: Partial<gaesupWorldContextType>;
  controllerContext?: gaesupControllerType;
  matchSizes?: {
    [key in keyof urlsType]?: THREE.Vector3;
  };
  delta?: number;
  dispatch?: dispatchType<gaesupWorldContextType>;
};

export type intersectObjectMapType = {
  [uuid: string]: THREE.Mesh;
};

export type cameraPropType = {
  state?: RootState;
  worldContext: Partial<gaesupWorldContextType>;
  controllerContext: gaesupControllerType;
  controllerOptions: controllerOptionsType;
};

// calculation
export type calcType = calcPropType & {
  groundRay: groundRayType;
};

// vehicle Inner

```

### gaesup\physics\airplane\damping.ts

```typescript
import { calcType } from "../type";

export default function damping(prop: calcType) {
  const {
    rigidBodyRef,
    controllerContext: { airplane },
  } = prop;
  const { linearDamping } = airplane;
  rigidBodyRef.current.setLinearDamping(linearDamping);
}

```

### gaesup\physics\airplane\direction.ts

```typescript
import { quat } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
import { calcType } from "../type";

export default function direction(prop: calcType) {
  const {
    innerGroupRef,
    worldContext: { activeState, control },
    controllerContext: { airplane },
    matchSizes,
  } = prop;
  const { forward, backward, leftward, rightward, shift, space } = control;
  const { angleDelta, maxAngle, accelRatio } = airplane;
  if (!matchSizes || !matchSizes["airplaneUrl"]) return null;

  let boost = 0;

  boost = space ? Number(shift) : Number(shift) * accelRatio;

  const upDown = Number(backward) - Number(forward);
  const leftRight = Number(rightward) - Number(leftward);
  const front = V3().set(boost, boost, boost);

  activeState.euler.y += -leftRight * angleDelta.y;

  const X = maxAngle.x * upDown;
  const Z = maxAngle.z * leftRight;

  const _x = innerGroupRef.current.rotation.x;
  const _z = innerGroupRef.current.rotation.z;

  const maxX = maxAngle.x;
  const maxZ = maxAngle.z;

  const innerGrounRefRotation = innerGroupRef.current.clone();

  if (_x < -maxX) {
    innerGrounRefRotation.rotation.x = -maxX + X;
  } else if (_x > maxX) {
    innerGrounRefRotation.rotation.x = maxX + X;
  } else {
    innerGrounRefRotation.rotateX(X);
  }

  if (_z < -maxZ) innerGrounRefRotation.rotation.z = -maxZ + Z;
  else if (_z > maxZ) innerGrounRefRotation.rotation.z = maxZ + Z;
  else innerGrounRefRotation.rotateZ(Z);
  activeState.euler.x = innerGrounRefRotation.rotation.x;
  activeState.euler.z = innerGrounRefRotation.rotation.z;

  innerGrounRefRotation.rotation.y = 0;
  innerGroupRef.current.setRotationFromQuaternion(
    quat()
      .setFromEuler(innerGroupRef.current.rotation.clone())
      .slerp(quat().setFromEuler(innerGrounRefRotation.rotation.clone()), 0.2)
  );

  activeState.rotation = innerGrounRefRotation.rotation;
  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), -upDown, Math.cos(activeState.euler.y))
  );
  activeState.dir = activeState.direction.normalize();
}

```

### gaesup\physics\airplane\gravity.ts

```typescript
import { calcType } from "../type";

export default function gravity(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
  } = prop;
  rigidBodyRef.current.setGravityScale(
    activeState.position.y < 10
      ? ((1 - 0.1) / (0 - 10)) * activeState.position.y + 1
      : 0.1,
    false
  );
}

```

### gaesup\physics\airplane\impulse.ts

```typescript
import { vec3 } from "@react-three/rapier";
import { calcType } from "../type";

export default function impulse(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
    controllerContext: { airplane },
  } = prop;
  const { maxSpeed } = airplane;
  const velocity = rigidBodyRef.current.linvel();
  // a = v / t (t = 1) (approximate calculation)
  const V = vec3(velocity).length();
  if (V < maxSpeed) {
    const M = rigidBodyRef.current.mass();
    // impulse = mass * velocity
    rigidBodyRef.current.applyImpulse(
      vec3({
        x: activeState.direction.x,
        y: activeState.direction.y,
        z: activeState.direction.z,
      }).multiplyScalar(M),
      false
    );
  }
}

```

### gaesup\physics\airplane\innerCalc.ts

```typescript
import { quat, vec3 } from "@react-three/rapier";
import { calcType } from "../type";

export default function innerCalc(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
    dispatch,
  } = prop;

  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());

  const _euler = activeState.euler.clone();
  _euler.x = 0;
  _euler.z = 0;
  rigidBodyRef.current.setRotation(quat().setFromEuler(_euler), true);

  dispatch({
    type: "update",
    payload: {
      activeState: {
        ...activeState,
      },
    },
  });
}

```

### gaesup\physics\airplane\landing.ts

```typescript
import { calcType } from "../type";

export default function landing(prop: calcType) {
  const {
    worldContext: { states, rideable, mode },
    dispatch,
  } = prop;
  const { isRiding } = states;
  if (isRiding) {
    rideable.objectType = null;
    rideable.key = null;
    mode.type = "character";
    states.isRiding = false;
    states.enableRiding = false;
  }

  dispatch({
    type: "update",
    payload: {
      mode: {
        ...mode,
      },
      rideable: {
        ...rideable,
      },
    },
  });
}

```

### gaesup\physics\character\direction.ts

```typescript
import { V3, calcAngleByVector } from '../../utils/vector';
import { gaesupWorldContextType } from '../../world/context/type';
import { calcType } from '../type';

export function orbitDirection({
  activeState,
  control,
  mode,
  clicker,
}: Partial<gaesupWorldContextType>) {
  const { forward, backward, leftward, rightward } = control;
  const dirX = Number(leftward) - Number(rightward);
  const dirZ = Number(forward) - Number(backward);
  let start = 0;
  if (mode.controller === 'clicker') {
    activeState.euler.y = Math.PI / 2 - clicker.angle;
    start = 1;
  } else {
    if (dirX === 0 && dirZ === 0) return;
    activeState.euler.y += (dirX * Math.PI) / 32;
    start = dirZ;
  }
  const front = V3(start, 0, start);
  activeState.direction = front.multiply(
    V3(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y)),
  );
  activeState.dir = activeState.direction.normalize();
}

export function normalDirection({
  activeState,
  control,
  mode,
  clicker,
}: Partial<gaesupWorldContextType>) {
  const { forward, backward, leftward, rightward } = control;
  if (mode.controller === 'clicker') {
    activeState.euler.y = Math.PI / 2 - clicker.angle;
    activeState.dir.set(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y));
  } else {
    // 일반 컨트롤
    // right hand rule. north -> east -> south -> west
    const dirX = Number(leftward) - Number(rightward);
    const dirZ = Number(forward) - Number(backward);
    if (dirX === 0 && dirZ === 0) return;
    const dir = V3(dirX, 0, dirZ);
    const angle = calcAngleByVector(dir);
    activeState.euler.y = angle;
    activeState.dir.set(dirX, 0, dirZ);
  }
}

export default function direction(prop: calcType) {
  const { worldContext } = prop;
  if (worldContext.mode.control === 'normal') {
    normalDirection(worldContext);
  } else if (worldContext.mode.control === 'orbit') {
    orbitDirection(worldContext);
  }
}

```

### gaesup\physics\character\impulse.ts

```typescript
import { vec3 } from "@react-three/rapier";
import { calcType } from "../type";

export default function impulse(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { states, activeState },
  } = prop;
  const { isMoving, isRunning } = states;
  const {
    controllerContext: {
      character: { walkSpeed, runSpeed, jumpSpeed },
    },
  } = prop;
  const { isOnTheGround, isJumping } = states;
  const impulse = vec3();
  if (isJumping && isOnTheGround) {
    impulse.setY(jumpSpeed * rigidBodyRef.current.mass());
  }
  if (isMoving) {
    const speed = isRunning ? runSpeed : walkSpeed;
    const velocity = vec3()
      .addScalar(speed)
      .multiply(activeState.dir.clone().normalize().negate());
    const M = rigidBodyRef.current.mass();
    // a = v / t = dv / 1 (dt = 1)
    const A = velocity.clone().sub(activeState.velocity);
    const F = A.multiplyScalar(M);
    impulse.setX(F.x);
    impulse.setZ(F.z);
  }
  rigidBodyRef.current.applyImpulse(impulse, true);
  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());
}

```

### gaesup\physics\character\innerCalc.ts

```typescript
import { quat } from "@react-three/rapier";
import { calcType } from "../type";

export default function innerCalc(prop: calcType) {
  const {
    rigidBodyRef,
    innerGroupRef,
    controllerContext: {
      character: { linearDamping },
    },
    worldContext: { activeState, states, block },
    delta,
  } = prop;

  if (states.isJumping || rigidBodyRef.current.linvel().y < 0) {
    rigidBodyRef.current.setLinearDamping(linearDamping);
  } else {
    rigidBodyRef.current.setLinearDamping(
      states.isNotMoving ? linearDamping * 5 : linearDamping
    );
  }
  rigidBodyRef.current.setEnabledRotations(false, false, false, false);
  innerGroupRef.current.quaternion.rotateTowards(
    quat().setFromEuler(activeState.euler),
    10 * delta
  );
}

```

### gaesup\physics\character\queue.ts

```typescript
import { vec3 } from "@react-three/rapier";
import * as THREE from "three";
import { calcNorm } from "../../utils";
import { calcType } from "../type";

export default function queue(prop: calcType) {
  const {
    rigidBodyRef,
    state,
    worldContext: { clicker, mode, clickerOption, block },
  } = prop;
  const u = vec3(rigidBodyRef.current?.translation());

  let norm = calcNorm(u, clicker.point, false);
  if (clickerOption.autoStart) {
    if (clickerOption.queue[0] instanceof THREE.Vector3) {
      clicker.isOn = true;
      norm = calcNorm(u, clickerOption.queue[0], false);
      const v = vec3(clickerOption.queue[0]);
      const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
      clicker.angle = newAngle;
    }
  }
  if (norm < 1 && mode.controller === "clicker") {
    if (clickerOption.track && clickerOption.queue.length !== 0) {
      const Q = clickerOption.queue.shift();
      if (Q instanceof THREE.Vector3) {
        clicker.point = Q;
        const v = vec3(clicker.point);
        const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
        clicker.angle = newAngle;
      } else {
        const { action, beforeCB, afterCB, time } = Q;
        if (action === "stop") {
          state.clock.stop();
          beforeCB(state);
          console.log();
          setTimeout(() => {
            state.clock.start();
            afterCB(state);
          }, time);
        }
      }
      if (clickerOption.loop) {
        clickerOption.queue.push(Q);
      }
    } else {
      clicker.isOn = false;
      clicker.isRun = false;
    }
  }
}

```

### gaesup\physics\character\stop.ts

```typescript
import { calcType } from "../type";

export default function stop(prop: calcType) {
  const {
    worldContext: { control, clicker, mode },
  } = prop;
  const { keyS } = control;

  if (keyS && mode.controller === "clicker") {
    clicker.isOn = false;
    clicker.isRun = false;
  }
}

```

### gaesup\physics\check\ground.ts

```typescript
import { vec3 } from "@react-three/rapier";
import { calcType } from "../type";

export default function checkOnTheGround(prop: calcType) {
  const {
    colliderRef,
    groundRay,
    worldContext: { states, activeState },
  } = prop;

  groundRay.origin.addVectors(activeState.position, vec3(groundRay.offset));
  if (!groundRay.hit || !groundRay.rayCast || !colliderRef.current) {
    states.isOnTheGround = false;
  }
  if (groundRay.hit) {
    const MAX = groundRay.length * 2;
    const MIN = groundRay.length * 0.8;
    if (groundRay.hit.toi >= MAX) {
      states.isFalling = true;
      states.isOnTheGround = false;
    } else if (MIN <= groundRay.hit.toi && groundRay.hit.toi < MAX) {
      states.isFalling = true;
    } else if (groundRay.hit.toi < MIN) {
      states.isFalling = false;
      states.isOnTheGround = true;
    }
  }
}

```

### gaesup\physics\check\index.ts

```typescript
import { calcType } from "../type";
import ground from "./ground";
import moving from "./moving";
import push from "./push";
import riding from "./riding";
import rotate from "./rotate";

export default function check(calcProp: calcType) {
  ground(calcProp);
  moving(calcProp);
  rotate(calcProp);
  push(calcProp);
  riding(calcProp);
}

```

### gaesup\physics\check\moving.ts

```typescript
import { calcType } from "../type";

export default function moving(prop: calcType) {
  const {
    worldContext: { states, mode, control, clicker, clickerOption },
  } = prop;
  const { shift, space } = control;
  if (mode.controller === "clicker") {
    states.isMoving = clicker.isOn;
    states.isNotMoving = !clicker.isOn;
    states.isRunning =
      (shift || clicker.isRun) && states.isMoving && clickerOption.isRun;
    states.isJumping = space;
  }
}

```

### gaesup\physics\check\push.ts

```typescript
import { calcType } from "../type";

export default function push(prop: calcType) {
  const {
    worldContext: { states, control },
  } = prop;
  Object.keys(control).forEach((key) => {
    states.isPush[key] = control[key];
  });
}

```

### gaesup\physics\check\riding.ts

```typescript
import { calcType } from "../type";

export default function riding(prop: calcType) {
  const {
    worldContext: { states },
  } = prop;

  const { isRiderOn } = states;
  if (isRiderOn && states.isPush["keyR"]) {
    states.isRiding = true;
  }
}

```

### gaesup\physics\check\rotate.ts

```typescript
import { calcType } from "../type";

export default function rotate(prop: calcType) {
  const {
    outerGroupRef,
    worldContext: { states, activeState },
  } = prop;
  if (states.isMoving && outerGroupRef && outerGroupRef.current) {
    states.isRotated =
      Math.sin(outerGroupRef.current.rotation.y).toFixed(3) ===
      Math.sin(activeState.euler.y).toFixed(3);
  }
}

```

### gaesup\physics\vehicle\damping.ts

```typescript
import { calcType } from "../type";

export default function damping(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { control },
    controllerContext: { vehicle },
  } = prop;
  const { space } = control;
  const { brakeRatio, linearDamping } = vehicle;
  rigidBodyRef.current.setLinearDamping(space ? brakeRatio : linearDamping);
}

```

### gaesup\physics\vehicle\direction.ts

```typescript
import { vec3 } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
import { calcType } from "../type";

export function normal(prop: calcType) {
  const {
    worldContext: { activeState, control },
  } = prop;
  const { forward, backward, leftward, rightward } = control;
  const xAxis = Number(leftward) - Number(rightward);
  const zAxis = Number(forward) - Number(backward);
  const front = vec3().set(zAxis, 0, zAxis);
  activeState.euler.y += xAxis * (Math.PI / 64);
  return front;
}

export default function direction(prop: calcType) {
  const {
    worldContext: { mode, activeState },
  } = prop;
  const front = vec3();
  front.copy(normal(prop));
  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y))
  );
  activeState.dir = activeState.direction.normalize();
}

```

### gaesup\physics\vehicle\impulse.ts

```typescript
import { vec3 } from "@react-three/rapier";
import { calcType } from "../type";

export default function impulse(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState, control },
    controllerContext: { vehicle },
  } = prop;
  const { shift } = control;
  const { maxSpeed, accelRatio } = vehicle;

  const velocity = rigidBodyRef.current.linvel();
  // a = v / t (t = 1) (approximate calculation)
  const V = vec3(velocity).length();
  if (V < maxSpeed) {
    const M = rigidBodyRef.current.mass();
    let speed = shift ? accelRatio : 1;
    // impulse = mass * velocity
    rigidBodyRef.current.applyImpulse(
      vec3()
        .addScalar(speed)
        .multiply(activeState.dir.clone().normalize())
        .multiplyScalar(M),
      false
    );
  }
}

```

### gaesup\physics\vehicle\innerCalc.ts

```typescript
import { quat, vec3 } from "@react-three/rapier";
import { calcType } from "../type";

export default function innerCalc(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
  } = prop;

  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());

  rigidBodyRef.current.setRotation(
    quat().setFromEuler(activeState.euler.clone()),
    false
  );
}

```

### gaesup\physics\vehicle\landing.ts

```typescript
import { calcType } from "../type";

export default function landing(prop: calcType) {
  const {
    worldContext: { states, rideable, mode },
    dispatch,
  } = prop;
  const { isRiding } = states;
  if (isRiding) {
    rideable.objectType = null;
    rideable.key = null;
    mode.type = "character";
    states.isRiding = false;
    states.enableRiding = false;
  }

  dispatch({
    type: "update",
    payload: {
      mode: {
        ...mode,
      },
      rideable: {
        ...rideable,
      },
    },
  });
}

```

### gaesup\tools\shared.css.ts

```typescript
import { style } from "@vanilla-extract/css";

// 공통 Flex 중앙 정렬 스타일
export const flexCenter = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
});

// 공통 버튼 스타일
export const commonButton = style([
  flexCenter,
  {
    width: "5rem",
    height: "5rem",
    cursor: "pointer",
    transition: "all 0.3s ease-in",
    boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.5)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    selectors: {
      "&:hover": {
        boxShadow: "0 0 1rem rgba(0, 0, 0, 0.5)",
      },
    },
  },
]);

// 미니맵 공통 사이즈 및 미디어 쿼리
export const minimapSize = {
  width: "18rem",
  height: "18rem",
  "@media": {
    "screen and (max-width: 1024px)": {
      width: "17rem",
      height: "17rem",
    },
    "screen and (max-width: 768px)": {
      width: "16rem",
      height: "16rem",
    },
  },
};

```

### gaesup\tools\type.ts

```typescript
import { CSSProperties } from "react";

export type VECssType = Record<keyof CSSProperties, string>;

```

### gaesup\tools\gamepad\style.css.ts

```typescript
import { globalStyle, style } from "@vanilla-extract/css";
import { commonButton } from "../shared.css";

export const gamePad = style({
  display: "grid",
  alignItems: "center",
  justifyContent: "center",
  gridTemplateColumns: "repeat(3, 1fr)",
  gridTemplateRows: "repeat(3, 1fr)",
});

export const padButton = style([
  commonButton,
  {
    position: "relative",
    fontSize: "1rem",
    margin: "0.5rem",
    borderRadius: "50%",
    selectors: {
      "&::after": {
        content: '""',
        position: "absolute",
        width: "4rem",
        height: "4rem",
        borderRadius: "50%",
        background: "rgba(0, 0, 0, 0.2)",
        zIndex: 100000,
      },
    },
  },
]);

export const isClicked = style({
  background:
    "radial-gradient(circle at center, rgba(245, 177, 97, 1) 0.4%, rgba(236, 54, 110, 1) 100.2%)",
  boxShadow: "0 0 1rem rgba(245, 177, 97, 1)",
  color: "black",
  transition: "all 0.3s ease-in",
  borderRadius: "50%",
  selectors: {
    "&:hover": {
      boxShadow: "0 0 2rem rgba(245, 177, 97, 1)",
    },
  },
});

// 사용자 선택 방지 글로벌 스타일
globalStyle(`${gamePad} *`, {
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
  MozUserSelect: "none",
  msUserSelect: "none",
  userSelect: "none",
});

```

### gaesup\tools\gamepad\type.ts

```typescript
import { CSSProperties } from 'react';

export type gamepadType = {
  label?: Record<string, string>;
} & {
  [key in 'gamePadButtonStyle' | 'gamePadStyle' | 'gamePadInnerStyle']?: CSSProperties;
};

export type gameBoyDirectionType = {
  tag: string;
  value: string;
  name: string;
  icon: JSX.Element;
};

export type GamePadButtonType = {
  value: string;
  name: string;
  gamePadButtonStyle?: CSSProperties;
};

```

### gaesup\tools\minimap\style.css.ts

```typescript
// import { keyframes, style } from "@vanilla-extract/css";
// import { flexCenter, minimapSize } from "../shared.css";
//
// // 키프레임 정의
// const pulseWhite = keyframes({
//   "0%": {
//     boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.7)",
//     opacity: 1,
//   },
//   "70%": {
//     boxShadow: "0 0 0 10px rgba(255, 255, 255, 0)",
//     opacity: 0.7,
//   },
//   "100%": {
//     boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)",
//     opacity: 1,
//   },
// });
//
// // 스타일 정의
// export const minimap = style([
//   {
//     margin: "1rem",
//     borderRadius: "50%",
//     background: "rgba(0, 0, 0, 0.6)",
//     boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
//     backdropFilter: "blur(1rem)",
//     WebkitBackdropFilter: "blur(1rem)",
//     border: "4px solid rgba(0, 0, 0, 0.5)",
//     overflow: "hidden",
//   },
//   minimapSize,
// ]);
//
// export const minimapOuter = style([
//   flexCenter,
//   {
//     position: "absolute",
//     textAlign: "center",
//     overflow: "hidden",
//   },
//   minimapSize,
// ]);
//
// export const minimapInner = style([
//   {
//     position: "relative",
//     display: "flex",
//     top: "50%",
//     left: "50%",
//     transformOrigin: "50% 50%",
//     borderRadius: "50%",
//     overflow: "hidden",
//   },
//   minimapSize,
// ]);
//
// export const avatar = style([
//   {
//     position: "absolute",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     textAlign: "center",
//     top: "50%",
//     left: "50%",
//     transform: "translate(-50%, -50%)",
//     width: "2rem",
//     height: "2rem",
//     borderRadius: "50%",
//     background: "rgba(5, 222, 250, 1)",
//     boxShadow: "0 0 10px rgba(5, 222, 250, 1)",
//     border: "2px solid transparent",
//     objectFit: "cover",
//     zIndex: 100,
//     animation: `${pulseWhite} 2s infinite`,
//   },
// ]);
//
// export const plusMinus = style([
//   {
//     position: "relative",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     width: "2rem",
//     height: "2rem",
//     borderRadius: "50%",
//     background: "rgba(0, 0, 0, 0.5)",
//     boxShadow: "0 0 5px rgba(0, 0, 0, 0.5)",
//     transition: "all 0.5s ease-in",
//     cursor: "pointer",
//     border: "2px solid transparent",
//     selectors: {
//       "&:hover": {
//         boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
//       },
//     },
//   },
// ]);
//
// export const scale = style([
//   {
//     position: "absolute",
//     width: "13rem",
//     bottom: "-5rem",
//     left: "50%",
//     transform: "translateX(-50%)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     fontSize: "1.2rem",
//     color: "white",
//     textShadow: "0 0 10px black",
//     padding: "0.5rem",
//     borderRadius: "0.5rem",
//     boxShadow: "0 0 10px black",
//     background: "rgba(0, 0, 0, 0.5)",
//     zIndex: 3,
//     WebkitBackdropFilter: "blur(2rem)",
//     backdropFilter: "blur(2rem)",
//     fontFamily: '"Open Sans", sans-serif',
//     fontWeight: 300,
//   },
// ]);
//
// export const text = style({
//   position: "relative",
//   fontSize: "1rem",
//   color: "black",
//   padding: "0.5rem",
//   borderRadius: "0.5rem",
//   background: "rgba(255, 255, 255, 0.5)",
//   boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
//   zIndex: 3,
// });
//
// export const minimapObject = style({
//   position: "absolute",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   textAlign: "center",
//   borderRadius: "2px",
//   background: "rgba(0, 0, 0, 0.3)",
// });
//
// export const imageObject = style({
//   position: "absolute",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   textAlign: "center",
//   background: `
//     linear-gradient(to bottom, transparent 95%, rgba(0, 0, 0, 0.2) 20%) 0 0 / 100% 40px repeat-y,
//     linear-gradient(to right, transparent 38px, rgba(0, 0, 0, 0.2) 38px) 0 0 / 40px 100% repeat-x transparent
//   `,
// });
//
// export const textObject = style({
//   position: "absolute",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   textAlign: "center",
// });
//
// const directionBase = style({
//   position: "absolute",
//   color: "white",
//   fontSize: "1.5rem",
//   zIndex: 2000,
// });
//
// export const east = style([
//   directionBase,
//   {
//     top: "50%",
//     right: 0,
//   },
// ]);
//
// export const west = style([
//   directionBase,
//   {
//     top: "50%",
//     left: 0,
//   },
// ]);
//
// export const south = style([
//   directionBase,
//   {
//     top: 0,
//     left: "50%",
//   },
// ]);
//
// export const north = style([
//   directionBase,
//   {
//     bottom: 0,
//     left: "50%",
//   },
// ]);
import { keyframes, style } from '@vanilla-extract/css';

const MINIMAP_SIZE = 200; // px 단위로 고정

// 키프레임 정의
const pulseWhite = keyframes({
  '0%': {
    boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)',
    opacity: 1,
  },
  '70%': {
    boxShadow: '0 0 0 10px rgba(255, 255, 255, 0)',
    opacity: 0.7,
  },
  '100%': {
    boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
    opacity: 1,
  },
});

// 기본 스타일
export const baseStyles = {
  minimap: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    width: `${MINIMAP_SIZE}px`,
    height: `${MINIMAP_SIZE}px`,
    zIndex: 100,
    cursor: 'pointer',
  },
  scale: {
    position: 'absolute',
    bottom: '20px',
    left: '230px',
    zIndex: 101,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'white',
    fontSize: '1rem',
    background: 'rgba(0,0,0,0.5)',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
  },
  plusMinus: {
    cursor: 'pointer',
    width: '2rem',
    height: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.5)',
    transition: 'all 0.2s',
    ':hover': {
      background: 'rgba(0,0,0,0.7)',
    },
  },
};

// 방향 표시 스타일
export const directionStyles = {
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: 'bold',
};

// 기본 오브젝트 스타일
export const objectStyles = {
  background: 'rgba(0,0,0,0.3)',
  boxShadow: '0 0 5px rgba(0,0,0,0.3)',
};

// 아바타 스타일
export const avatarStyles = {
  background: '#01fff7',
  boxShadow: '0 0 10px rgba(1,255,247,0.7)',
};

// 텍스트 스타일
export const textStyles = {
  color: 'white',
  fontSize: '1rem',
  fontWeight: 'bold',
};

export const MINIMAP_SIZE_PX = MINIMAP_SIZE;

```

### gaesup\tools\minimap\type.ts

```typescript
import { CSSProperties, ReactElement } from 'react';
import * as THREE from 'three';

export type minimapPropsType = {
  type: 'normal' | 'ground';
  text?: string;
  center: THREE.Vector3;
  size: THREE.Vector3;
  children?: ReactElement;
  position?: THREE.Vector3;
};

export type minimapInnerType = {
  props: {
    [key: string]: minimapPropsType;
  };
};

export type minimapType = {
  [key in
    | 'minimapStyle'
    | 'minimapOuterStyle'
    | 'minimapInnerStyle'
    | 'minimapObjectStyle'
    | 'textStyle'
    | 'objectStyle'
    | 'avatarStyle'
    | 'directionStyle'
    | 'scaleStyle'
    | 'imageStyle'
    | 'plusMinusStyle']?: CSSProperties;
} & {
  minScale?: number;
  maxScale?: number;
  blockScale?: boolean;
  scale?: number;
  angle?: number;
  blockRotate?: boolean;
  blockScaleControl?: boolean;
  isImage?: boolean;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
};
export interface MinimapProps {
  scale?: number;
  minScale?: number;
  maxScale?: number;
  blockScale?: boolean;
  blockScaleControl?: boolean;
  blockRotate?: boolean;
  angle?: number;
  minimapStyle?: React.CSSProperties;
  minimapInnerStyle?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  minimapObjectStyle?: React.CSSProperties;
  avatarStyle?: React.CSSProperties;
  scaleStyle?: React.CSSProperties;
  directionStyle?: React.CSSProperties;
  plusMinusStyle?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Euler {
  x: number;
  y: number;
  z: number;
}

export interface Size {
  x: number;
  z: number;
}

export interface MinimapObject {
  center: Position;
  size: Size;
  text?: string;
}

export interface MinimapState {
  props: Record<string, MinimapObject>;
}

export interface ActiveState {
  position: Position;
  euler: Euler;
}

export interface Mode {
  control: 'normal' | string;
}

```

### gaesup\tools\rideable\type.ts

```typescript
import { RigidBodyProps } from "@react-three/rapier";
import * as THREE from "three";
import { controllerOptionsType } from "../../controller/type";

export type rideablePropType = {
  groundRay: any;
  objectkey: string;
  objectType?: "vehicle" | "airplane";
  controllerOptions: controllerOptionsType;
  enableRiding?: boolean;
  isRiderOn?: boolean;
  url?: string;
  characterUrl?: string;
  ridingUrl?: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  offset?: THREE.Vector3;
  landingOffset?: THREE.Vector3;
  visible?: boolean;
  vehicleSize?: THREE.Vector3;
  wheelSize?: THREE.Vector3;
  airplaneSize?: THREE.Vector3;
  rigidBodyProps?: RigidBodyProps;
  outerGroupProps?: THREE.Group;
  innerGroupProps?: THREE.Group;
};

```

### gaesup\tools\teleport\style.css.ts

```typescript
import { style } from "@vanilla-extract/css";
import { commonButton } from "../shared.css";

export const teleport = style([
  commonButton,
  {
    margin: "1rem",
    fontSize: "0.8rem",
    background: "rgba(0, 0, 0, 0.6)",
    boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.6)",
    transition: "all 0.2s ease-in",
    borderRadius: "50%",
  },
]);

```

### gaesup\tools\teleport\type.ts

```typescript
import { CSSProperties } from "react";
import * as THREE from "three";

export type teleportType = {
  text?: string;
  position: THREE.Vector3;
  teleportStyle?: CSSProperties;
};

```

### gaesup\utils\context.ts

```typescript
import { dispatchType } from './type';

export const update = <T>(payload: Partial<T>, dispatch: dispatchType<T>) => {
  dispatch({ type: 'update', payload });
};

```

### gaesup\utils\getTag.ts

```typescript
import * as THREE from "three";

// split한 태그의 첫번째 문자열을 가져오는 함수.
export const getTag = (node?: THREE.Mesh) => node?.name?.split("_")?.[0];
// 태그와 이름이 일치하는지 확인
export const isEqual = (tag: string, node?: THREE.Mesh) =>
  node?.name?.split("_")?.[0] === tag;

```

### gaesup\utils\index.ts

```typescript
export * from './ray';
export * from './ref';
export * from './vector';

```

### gaesup\utils\ray.ts

```typescript
import { Collider } from "@dimforge/rapier3d-compat";
import { useRapier } from "@react-three/rapier";
import { RefObject } from "react";
import { groundRayType } from "../controller/type";

export const getRayHit = ({
  ray,
  ref,
}: {
  ray: groundRayType;
  ref: RefObject<Collider>;
}) => {
  const { world } = useRapier();
  return world.castRay(
    ray.rayCast,
    ray.length,
    true,
    undefined,
    undefined,
    ref.current as any,
    undefined
  );
};

```

### gaesup\utils\ref.ts

```typescript
import { ForwardedRef, useEffect, useRef } from "react";

export const useForwardRef = <T>(
  ref: ForwardedRef<T>,
  initialValue: any = null
) => {
  const targetRef = useRef<T>(initialValue);
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(targetRef.current);
    } else {
      targetRef.current = ref.current;
    }
  }, [ref]);
  return targetRef;
};

```

### gaesup\utils\type.ts

```typescript
import { Dispatch } from "react";

export type dispatchType<T> = Dispatch<{
  type: string;
  payload?: Partial<T>;
}>;

```

### gaesup\utils\vector.ts

```typescript
import * as THREE from 'three';

export function isVectorNonZero(v: THREE.Vector3): boolean {
  return v.toArray().every((value) => value !== 0);
}

export function calcNorm(u: THREE.Vector3, v: THREE.Vector3, calcZ: boolean): number {
  return Math.sqrt(
    Math.pow(u.x - v.x, 2) + (calcZ && Math.pow(u.y - v.y, 2)) + Math.pow(u.z - v.z, 2),
  );
}

export function isValidOrZero(condision: boolean, vector: THREE.Vector3): THREE.Vector3 {
  return condision ? vector : new THREE.Vector3(0, 0, 0);
}

export function isValidOrOne(condision: boolean, vector: THREE.Vector3): THREE.Vector3 {
  return condision ? vector : new THREE.Vector3(1, 1, 1);
}

export function calcAngleByVector(dir: THREE.Vector3): number {
  const axis = V3(0, 0, 1);
  const angles = Math.acos(dir.dot(axis) / dir.length());
  const product = dir.cross(axis);
  const isLeft = Math.sin(product.y) || 1;
  const angle = Math.PI - angles * isLeft;
  return angle;
}
export const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const Qt = (x = 0, y = 0, z = 0, w = 1) => new THREE.Quaternion(x, y, z, w);
export const Elr = (x = 0, y = 0, z = 0) => new THREE.Euler(x, y, z);
export const V30 = () => new THREE.Vector3();
export const V31 = () => new THREE.Vector3(1, 1, 1);

```

### gaesup\world\type.ts

```typescript
import { ReactNode } from "react";
import * as THREE from "three";
import { dispatchType } from "../utils/type";
import {
  blockType,
  cameraOptionType,
  clickerOptionType,
  gaesupWorldContextType,
  modeType,
  urlsType,
} from "./context/type";

export type gaesupWorldInitType = {
  value: gaesupWorldContextType;
  dispatch: dispatchType<gaesupWorldContextType>;
};

export type gaesupWorldPropsType = {
  children: ReactNode;
  startPosition?: THREE.Vector3;
  urls?: urlsType;
  mode?: modeType;
  debug?: boolean;
  cameraOption?: cameraOptionType;
  block?: blockType;
  clickerOption?: clickerOptionType;
};

```

### gaesup\world\context\index.ts

```typescript
import { euler, quat, vec3 } from '@react-three/rapier';
import { createContext } from 'react';
import { dispatchType } from '../../utils/type';
import { V3 } from '../../utils/vector';
import { gaesupWorldContextType } from './type';

export const gaesupWorldDefault: gaesupWorldContextType = {
  activeState: {
    position: V3(0, 5, 5),
    impulse: vec3(),
    velocity: vec3(),
    acceleration: vec3(),
    quat: quat(),
    euler: euler(),
    rotation: euler(),
    dir: vec3(),
    direction: vec3(),
  },
  mode: {},
  urls: {
    characterUrl: null,
    vehicleUrl: null,
    airplaneUrl: null,
    wheelUrl: null,
    ridingUrl: null,
  },
  states: {
    rideableId: null,
    isMoving: false,
    isNotMoving: false,
    isOnTheGround: false,
    isOnMoving: false,
    isRotated: false,
    isRunning: false,
    isJumping: false,
    enableRiding: false,
    isRiderOn: false,
    isLanding: false,
    isFalling: false,
    isRiding: false,
    isPush: {
      forward: false,
      backward: false,
      leftward: false,
      rightward: false,
    },
  },
  minimap: {
    props: {},
  },
  clicker: {
    point: V3(0, 0, 0),
    angle: Math.PI / 2,
    isOn: false,
    isRun: false,
  },
  control: {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
  },
  refs: null,
  animationState: {
    character: {
      current: 'idle',
      default: 'idle',
      store: {},
    },
    vehicle: {
      current: 'idle',
      default: 'idle',
      store: {},
    },
    airplane: {
      current: 'idle',
      default: 'idle',
      store: {},
    },
  },
  cameraOption: {
    offset: V3(-10, -10, -10),
    maxDistance: -7,
    distance: -1,
    XDistance: 20,
    YDistance: 10,
    ZDistance: 20,
    zoom: 1,
    target: vec3(),
    position: vec3(),
    focus: false,
  },
  rideable: {},
  sizes: {},
  block: {
    camera: false,
    control: false,
    animation: false,
    scroll: true,
  },
  clickerOption: {
    isRun: true,
    throttle: 100,
    autoStart: false,
    track: false,
    loop: false,
    queue: [],
    line: false,
  },
};

export const GaesupWorldContext = createContext<Partial<gaesupWorldContextType>>(null);
export const GaesupWorldDispatchContext =
  createContext<dispatchType<Partial<gaesupWorldContextType>>>(null);

```

### gaesup\world\context\reducer.ts

```typescript
import { gaesupWorldContextType } from "./type";

export function gaesupWorldReducer(
  props: Partial<gaesupWorldContextType>,
  action: {
    type: string;
    payload?: Partial<gaesupWorldContextType>;
  }
) {
  switch (action.type) {
    case "init": {
      return { ...props };
    }
    case "update": {
      return { ...props, ...action.payload };
    }
  }
}

```

### gaesup\world\context\type.ts

```typescript
import { CSSProperties } from 'react';
import { actionsType, refsType } from '../../controller/type';

import { RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { rideableType } from '../../hooks/useRideable/type';
import { minimapInnerType } from '../../tools/minimap/type';

import { dispatchType } from '../../utils/type';

// camera option
export type gaesupCameraOptionDebugType = {
  maxDistance?: number;
  distance?: number;
  XDistance?: number;
  YDistance?: number;
  ZDistance?: number;
  zoom?: number;
  target?: THREE.Vector3;
  focus?: boolean;
  position?: THREE.Vector3;
};

export type cameraOptionType = {
  offset?: THREE.Vector3;
} & gaesupCameraOptionDebugType;

export type controlType = {
  forward: boolean;
  backward: boolean;
  leftward: boolean;
  rightward: boolean;
  [key: string]: boolean;
};

export type keyControlType = {
  [key: string]: boolean;
};

export type portalType = {
  text?: string;
  position: THREE.Vector3;
  teleportStlye?: CSSProperties;
};

export type portalsType = portalType[];

export type statesType = {
  rideableId?: string;
  isMoving: boolean;
  isNotMoving: boolean;
  isOnTheGround: boolean;
  isOnMoving: boolean;
  isRotated: boolean;
  isRunning: boolean;
  isJumping: boolean;
  enableRiding: boolean;
  isRiderOn: boolean;
  isPush: controlType;
  isLanding: boolean;
  isFalling: boolean;
  isRiding: boolean;
};

export type urlsType = {
  characterUrl?: string;
  vehicleUrl?: string;
  airplaneUrl?: string;
  wheelUrl?: string;
  ridingUrl?: string;
};

export type animationAtomType = {
  tag: string;
  condition: () => boolean;
  action?: () => void;
  animationName?: string;
  key?: string;
};

export type animationPropType = {
  current: string;
  animationNames: actionsType;
  keyControl: {
    [key: string]: boolean;
  };
  store: {};
  default: string;
};

export type animationStatePropType = {
  current: string;
  animationNames?: actionsType;
  keyControl?: {
    [key: string]: boolean;
  };
  store: {};
  default: string;
};

export type modeType = {
  type?: 'character' | 'vehicle' | 'airplane';
  controller?: 'clicker';
  control?: 'normal' | 'orbit';
  isButton?: boolean;
};

export type activeStateType = {
  position: THREE.Vector3;
  impulse: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  rotation: THREE.Euler;
  direction: THREE.Vector3;
  dir: THREE.Vector3;
};

// camera option
export type clickerType = {
  point: THREE.Vector3;
  angle: number;
  isOn: boolean;
  isRun: boolean;
};
// 클리커 옵션
export type queueActionType = 'stop';
export type queueFunctionType = {
  action: queueActionType;
  beforeCB: (state: RootState) => void;
  afterCB: (state: RootState) => void;
  time: number;
};

export type queueItemtype = THREE.Vector3 | queueFunctionType;

export type queueType = queueItemtype[];
export type clickerOptionType = {
  autoStart?: boolean;
  isRun?: boolean;
  throttle?: number;
  track?: boolean;
  loop?: boolean;
  queue?: queueType;
  line?: boolean;
};

export type wheelStateType = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
};

export type blockType = {
  camera: boolean;
  control: boolean;
  animation: boolean;
  scroll: boolean;
};

export type sizeType = {
  x: number;
  y: number;
  z: number;
};

export type wheelsStateType = {
  0?: wheelStateType;
  1?: wheelStateType;
  2?: wheelStateType;
  3?: wheelStateType;
};

export type passiveStateType = {
  position: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  rotation: THREE.Euler;
};

export type animationStateType = {
  [key: string]: animationStatePropType;
};

export type sizesType = {
  [key: string]: THREE.Vector3;
};

type KeyboardControlsState<T extends string = string> = {
  [K in T]: boolean;
};

export type gaesupWorldContextType = {
  activeState: activeStateType;
  mode: modeType;
  urls: urlsType;
  states: statesType;
  minimap: minimapInnerType;
  control: KeyboardControlsState<string>;
  refs: refsType;
  animationState: animationStateType;
  cameraOption: cameraOptionType;
  clickerOption: clickerOptionType;
  clicker: clickerType;
  rideable: { [key: string]: rideableType };
  sizes: sizesType;
  block: blockType;
};

export type gaesupDisptachType = dispatchType<gaesupWorldContextType>;

```

### gaesup\world\initalize\index.ts

```typescript
import { useMemo, useReducer } from 'react';

import { gaesupWorldDefault } from '../../world/context';
import { gaesupWorldReducer } from '../../world/context/reducer';
import { gaesupWorldPropsType } from '../type';

export default function initGaesupWorld(props: gaesupWorldPropsType) {
  const [value, dispatch] = useReducer(gaesupWorldReducer, {
    activeState: {
      ...gaesupWorldDefault.activeState,
      position: props.startPosition || gaesupWorldDefault.activeState.position,
    },
    cameraOption: Object.assign(gaesupWorldDefault.cameraOption, props.cameraOption || {}),
    mode: Object.assign(gaesupWorldDefault.mode, props.mode || {}),
    urls: Object.assign(gaesupWorldDefault.urls, props.urls || {}),
    refs: null,
    states: gaesupWorldDefault.states,
    rideable: gaesupWorldDefault.rideable,
    minimap: gaesupWorldDefault.minimap,
    control: gaesupWorldDefault.control,
    clicker: gaesupWorldDefault.clicker,
    clickerOption: Object.assign(gaesupWorldDefault.clickerOption, props.clickerOption || {}),
    animationState: gaesupWorldDefault.animationState,
    block: Object.assign(gaesupWorldDefault.block, props.block || {}),
    sizes: gaesupWorldDefault.sizes,
  });

  const gaesupProps = useMemo(() => ({ value: value, dispatch }), [value, value.block, dispatch]);

  return {
    gaesupProps,
  };
}

```

## TypeScript React Files (.tsx)

### gaesup\camera\index.tsx

```tsx
import { useFrame } from '@react-three/fiber';
import { cameraPropType } from '../physics/type';
import normal, { makeNormalCameraPosition } from './control/normal';
import orbit from './control/orbit';

export default function Camera(prop: cameraPropType) {
  useFrame((state) => {
    prop.state = state;
    if (!prop.worldContext.block.camera) {
      if (prop.worldContext.mode.control === 'orbit') {
        orbit(prop);
      } else if (prop.worldContext.mode.control === 'normal') {
        normal(prop);
      }
    }
  });
  // 포커스가 아닐 때 카메라 activeStae 따라가기
  useFrame(() => {
    if (!prop.worldContext.cameraOption.focus) {
      prop.worldContext.cameraOption.target = prop.worldContext.activeState.position;
      prop.worldContext.cameraOption.position = makeNormalCameraPosition(
        prop.worldContext.activeState,
        prop.worldContext.cameraOption,
      );
    }
  });
}

```

### gaesup\component\index.tsx

```tsx
import { vec3 } from '@react-three/rapier';
import { useContext } from 'react';
import { controllerInnerType, refsType } from '../controller/type';
import { GaesupWorldContext } from '../world/context';
import { AirplaneRef } from './active/airplane';
import { CharacterRef } from './active/character';
import { VehicleRef } from './active/vehicle';

export function GaesupComponent({ props, refs }: { props: controllerInnerType; refs: refsType }) {
  const { mode, states, rideable, urls } = useContext(GaesupWorldContext);
  const { enableRiding, isRiderOn, rideableId } = states;

  return (
    <>
      {mode.type === 'character' && (
        <CharacterRef props={props} refs={refs} urls={urls}>
          {props.children}
        </CharacterRef>
      )}
      {mode.type === 'vehicle' && (
        <VehicleRef
          controllerOptions={props.controllerOptions}
          url={urls.vehicleUrl}
          wheelUrl={urls.wheelUrl}
          ridingUrl={urls.ridingUrl}
          enableRiding={enableRiding}
          isRiderOn={isRiderOn}
          groundRay={props.groundRay}
          offset={rideableId && rideable[rideableId] ? rideable[rideableId].offset : vec3()}
          {...refs}
        >
          {props.children}
        </VehicleRef>
      )}
      {mode.type === 'airplane' && (
        <AirplaneRef
          controllerOptions={props.controllerOptions}
          url={urls.airplaneUrl}
          ridingUrl={urls.ridingUrl}
          enableRiding={enableRiding}
          isRiderOn={isRiderOn}
          groundRay={props.groundRay}
          offset={rideableId && rideable[rideableId] ? rideable[rideableId].offset : vec3()}
          {...refs}
        >
          {props.children}
        </AirplaneRef>
      )}
    </>
  );
}

```

### gaesup\component\active\airplane\index.tsx

```tsx
import { AirplaneInnerRef } from "../../inner/airplane";
import { activeAirplaneInnerType } from "./type";

export function AirplaneRef(props: activeAirplaneInnerType) {
  return (
    <AirplaneInnerRef
      name={"airplane"}
      isActive={true}
      currentAnimation={"idle"}
      componentType={"airplane"}
      ridingUrl={props.ridingUrl}
      {...props}
    >
      {props.children}
    </AirplaneInnerRef>
  );
}

```

### gaesup\component\active\character\index.tsx

```tsx
import { controllerInnerType, refsType } from "../../../controller/type";
import { urlsType } from "../../../world/context/type";
import { CharacterInnerRef } from "../../inner/character";

export function CharacterRef({
  children,
  props,
  refs,
  urls,
}: {
  children: React.ReactNode;
  props: controllerInnerType;
  refs: refsType;
  urls: urlsType;
}) {
  return (
    <CharacterInnerRef
      url={urls.characterUrl}
      isActive={true}
      componentType="character"
      rigidbodyType={"dynamic"}
      controllerOptions={props.controllerOptions}
      groundRay={props.groundRay}
      onAnimate={props.onAnimate}
      onFrame={props.onFrame}
      onReady={props.onReady}
      onDestory={props.onDestory}
      rigidBodyProps={props.rigidBodyProps}
      parts={props.parts}
      {...refs}
    >
      {children}
    </CharacterInnerRef>
  );
}

```

### gaesup\component\active\vehicle\index.tsx

```tsx
import { VehicleInnerRef } from "../../inner/vehicle";
import { activeVehicleInnerType } from "./type";

export function VehicleRef(props: activeVehicleInnerType) {
  return (
    <VehicleInnerRef
      name={"vehicle"}
      isActive={true}
      currentAnimation={"idle"}
      componentType={"vehicle"}
      ridingUrl={props.ridingUrl}
      {...props}
    >
      {props.children}
    </VehicleInnerRef>
  );
}

```

### gaesup\component\inner\airplane\index.tsx

```tsx
import { OuterGroupRef } from '../common/OuterGroupRef';
import { RigidBodyRef } from '../common/RigidbodyRef';
import { airplaneInnerType } from './type';

export function AirplaneInnerRef(props: airplaneInnerType) {
  const { rigidBodyRef, outerGroupRef } = props;

  return (
    <OuterGroupRef ref={outerGroupRef}>
      <RigidBodyRef
        ref={rigidBodyRef}
        name={props.name}
        componentType={'airplane'}
        ridingUrl={props.ridingUrl}
        {...props}
      >
        {props.children}
      </RigidBodyRef>
    </OuterGroupRef>
  );
}

```

### gaesup\component\inner\character\index.tsx

```tsx
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { characterInnerType } from "./type";

export function CharacterInnerRef(props: characterInnerType) {
  const { outerGroupRef } = props;
  return (
    <OuterGroupRef ref={outerGroupRef}>
      <RigidBodyRef
        name={"character"}
        url={props.url}
        controllerOptions={props.controllerOptions}
        ref={props.rigidBodyRef}
        groundRay={props.groundRay}
        isNotColliding={props.isNotColliding}
        {...props}
      >
        {props.children}
      </RigidBodyRef>
    </OuterGroupRef>
  );
}

```

### gaesup\component\inner\common\InnerGroupRef.tsx

```tsx
import { Ref, forwardRef } from "react";
import * as THREE from "three";
import RiderRef from "../rider";
import { InnerGroupRefType } from "./type";

export const InnerGroupRef = forwardRef(
  (props: InnerGroupRefType, ref: Ref<THREE.Group>) => {
    return (
      <group receiveShadow castShadow ref={ref} userData={{ intangible: true }}>
        {props.isRiderOn &&
          props.enableRiding &&
          props.isActive &&
          props.ridingUrl && (
            <RiderRef url={props.ridingUrl} offset={props.offset} />
          )}

        {props.children}
        {props.objectNode && props.animationRef && (
          <primitive
            object={props.objectNode}
            visible={false}
            receiveShadow
            castShadow
            ref={props.animationRef}
          />
        )}

        {Object.keys(props.nodes).map((name: string, key: number) => {
          const node = props.nodes[name];
          if (node instanceof THREE.SkinnedMesh) {
            return (
              <skinnedMesh
                castShadow
                receiveShadow
                material={node.material}
                geometry={node.geometry}
                skeleton={node.skeleton}
                key={key}
              />
            );
          } else if (node instanceof THREE.Mesh) {
            return (
              <mesh
                castShadow
                receiveShadow
                material={node.material}
                geometry={node.geometry}
                key={key}
              />
            );
          }
        })}
      </group>
    );
  }
);

```

### gaesup\component\inner\common\OuterGroupRef.tsx

```tsx
import { forwardRef, MutableRefObject, ReactNode } from "react";
import * as THREE from "three";

export const OuterGroupRef = forwardRef(
  (
    {
      children,
    }: {
      children: ReactNode;
    },
    ref: MutableRefObject<THREE.Group>
  ) => {
    return (
      <group ref={ref} userData={{ intangible: true }}>
        {children}
      </group>
    );
  }
);

```

### gaesup\component\inner\common\partsGroupRef.tsx

```tsx
import { useAnimations, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import playActions from "../../../animation/actions";
import { componentTypeString } from "../../passive/type";

export const PartsGroupRef = ({
  url,
  isActive,
  componentType,
  currentAnimation,
  color,
  skeleton,
}: {
  url: string;
  isActive: boolean;
  componentType: componentTypeString;
  currentAnimation: string;
  color?: string;
  skeleton?: THREE.Skeleton;
}) => {
  const { scene, animations } = useGLTF(url);
  const { actions, ref } = useAnimations(animations);

  const clonedMeshes = useMemo(() => {
    const meshes = [];
    scene.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh) {
        const clonedMesh = child.clone();
        clonedMesh.skeleton = skeleton;
        clonedMesh.bind(skeleton, clonedMesh.bindMatrix);
        meshes.push(clonedMesh);
      }
    });
    return meshes;
  }, [scene, skeleton]);

  playActions({
    type: componentType,
    actions,
    animationRef: ref,
    currentAnimation: isActive ? undefined : currentAnimation,
    isActive,
  });

  return (
    <>
      {clonedMeshes.map((mesh, key) => {
        return (
          <skinnedMesh
            castShadow
            receiveShadow
            geometry={mesh.geometry}
            skeleton={skeleton}
            key={key}
            material={
              mesh.name === "color" && color
                ? new THREE.MeshStandardMaterial({ color })
                : mesh.material
            }
          />
        );
      })}
    </>
  );
};

```

### gaesup\component\inner\common\RigidbodyRef.tsx

```tsx
import { useAnimations, useGLTF } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { CapsuleCollider, RapierRigidBody, RigidBody, euler } from '@react-three/rapier';
import { MutableRefObject, forwardRef, useContext, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import playActions, { subscribeActions } from '../../../animation/actions';
import Camera from '../../../camera';
import { GaesupControllerContext } from '../../../controller/context';
import initCallback from '../../../controller/initialize/callback';
import { useGltfAndSize } from '../../../hooks/useGaesupGltf';
import calculation from '../../../physics';
import { cameraPropType } from '../../../physics/type';
import { GaesupWorldContext } from '../../../world/context';
import { InnerGroupRef } from './InnerGroupRef';
import { PartsGroupRef } from './partsGroupRef';
import { useSetGroundRay } from './setGroundRay';
import { rigidBodyRefType } from './type';

export const RigidBodyRef = forwardRef(
  (props: rigidBodyRefType, ref: MutableRefObject<RapierRigidBody>) => {
    const { size } = useGltfAndSize({ url: props.url });
    const setGroundRay = useSetGroundRay();
    useEffect(() => {
      if (props.groundRay && props.colliderRef) {
        setGroundRay({
          groundRay: props.groundRay,
          length: 0.5,
          colliderRef: props.colliderRef,
        });
      }
    }, [props.groundRay, props.colliderRef, setGroundRay]);
    const { scene, animations } = useGLTF(props.url);
    const { actions, ref: animationRef } = useAnimations(animations);
    const worldContext = useContext(GaesupWorldContext);
    const controllerContext = useContext(GaesupControllerContext);
    // skeleton을 추출하여 memoization
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const skeleton = useMemo(() => {
      let skel = null;
      clone.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh) {
          skel = child.skeleton;
        }
      });
      return skel;
    }, [clone]);

    if (props.isActive) {
      subscribeActions({
        type: props.componentType,
        groundRay: props.groundRay,
        animations: animations,
      });
      const cameraProps: cameraPropType = {
        state: null,
        worldContext,
        controllerContext,
        controllerOptions: props.controllerOptions,
      };

      Camera(cameraProps);
      calculation({
        outerGroupRef: props.outerGroupRef,
        innerGroupRef: props.innerGroupRef,
        rigidBodyRef: ref,
        colliderRef: props.colliderRef,
        groundRay: props.groundRay,
      });
    }
    playActions({
      type: props.componentType,
      actions,
      animationRef,
      currentAnimation: props.isActive ? undefined : props.currentAnimation,
      isActive: props.isActive,
    });
    initCallback({
      props,
      actions,
      componentType: props.componentType,
    });
    const { nodes } = useGraph(clone);
    const objectNode = Object.values(nodes).find((node) => node.type === 'Object3D');
    return (
      <RigidBody
        colliders={false}
        ref={ref}
        name={props.name}
        rotation={euler()
          .set(0, props.rotation?.clone().y || 0, 0)
          .clone()}
        userData={props.userData}
        type={props.rigidbodyType || (props.isActive ? 'dynamic' : 'fixed')}
        sensor={props.sensor}
        onIntersectionEnter={props.onIntersectionEnter}
        onCollisionEnter={props.onCollisionEnter}
        {...props.rigidBodyProps}
      >
        {!props.isNotColliding && (
          <CapsuleCollider
            ref={props.colliderRef as any}
            args={[(size.y / 2 - size.x) * 1.2, size.x * 1.2]}
            position={[0, (size.y / 2 + size.x / 2) * 1.2, 0]}
          />
        )}
        <InnerGroupRef
          objectNode={objectNode}
          animationRef={animationRef}
          nodes={nodes}
          ref={props.innerGroupRef}
          isActive={props.isActive}
          isRiderOn={props.isRiderOn}
          enableRiding={props.enableRiding}
          ridingUrl={props.ridingUrl}
          offset={props.offset}
          parts={props.parts}
        >
          {props.children}
          {props.parts &&
            props.parts.length > 0 &&
            props.parts.map(({ url, color }, key) => {
              if (!url) return null;
              return (
                <PartsGroupRef
                  url={url}
                  isActive={props.isActive}
                  componentType={props.componentType}
                  currentAnimation={props.currentAnimation}
                  color={color}
                  key={key + url}
                  skeleton={skeleton}
                />
              );
            })}
        </InnerGroupRef>
      </RigidBody>
    );
  },
);

```

### gaesup\component\inner\rider\index.tsx

```tsx
import { useAnimations } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import { ReactNode, useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playActions from "../../../animation/actions";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";

export type riderRefType = {
  url: string;
  children?: ReactNode;
  offset?: THREE.Vector3;
  euler?: THREE.Euler;
  currentAnimation?: string;
};

export default function RiderRef({
  url,
  children,
  offset,
  currentAnimation,
}: riderRefType) {
  const { gltf } = useGltfAndSize({ url });
  const { animations, scene } = gltf;
  const { actions, ref: animationRef } = useAnimations(animations);
  const characterClone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes: characterNodes } = useGraph(characterClone);
  const characterObjectNode = Object.values(characterNodes).find(
    (node) => node.type === "Object3D"
  );
  playActions({
    type: "character",
    currentAnimation: currentAnimation || "ride",
    actions,
    animationRef,
    isActive: false,
  });
  return (
    <>
      <group position={offset}>
        {characterObjectNode && (
          <primitive
            object={characterObjectNode}
            visible={false}
            receiveShadow
            castShadow
            ref={animationRef}
          />
        )}
        {Object.keys(characterNodes).map((name: string, key: number) => {
          const characterNode = characterNodes[name];
          if (characterNode instanceof THREE.SkinnedMesh) {
            return (
              <skinnedMesh
                castShadow
                receiveShadow
                material={characterNode.material}
                geometry={characterNode.geometry}
                skeleton={characterNode.skeleton}
                key={key}
              />
            );
          } else if (characterNode instanceof THREE.Mesh) {
            return (
              <mesh
                castShadow
                receiveShadow
                material={characterNode.material}
                geometry={characterNode.geometry}
                key={key}
              />
            );
          }
        })}
        {children}
      </group>
    </>
  );
}

```

### gaesup\component\inner\vehicle\collider.tsx

```tsx
import { Collider } from "@dimforge/rapier3d-compat";
import { CuboidCollider } from "@react-three/rapier";
import { Ref, forwardRef } from "react";
import * as THREE from "three";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";

export const VehicleWheelCollider = forwardRef(
  (
    { wheelUrl, vehicleSize }: { wheelUrl: string; vehicleSize: THREE.Vector3 },
    ref: Ref<Collider>
  ) => {
    const { size: wheelSize } = useGltfAndSize({
      url: wheelUrl,
    });

    return (
      <CuboidCollider
        ref={ref as any}
        args={[
          vehicleSize.x / 2,
          vehicleSize.y / 2 - wheelSize.y / 2,
          vehicleSize.z / 2,
        ]}
        position={[0, vehicleSize.y / 2 + wheelSize.y / 2, 0]}
      />
    );
  }
);

export const VehicleCollider = forwardRef(
  ({ vehicleSize }: { vehicleSize: THREE.Vector3 }, ref: Ref<Collider>) => {
    return (
      <CuboidCollider
        ref={ref as any}
        args={[vehicleSize.x / 2, vehicleSize.y / 2, vehicleSize.z / 2]}
        position={[0, vehicleSize.y / 2, 0]}
      />
    );
  }
);

```

### gaesup\component\inner\vehicle\index.tsx

```tsx
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { vehicleInnerType } from "./type";

export function VehicleInnerRef(props: vehicleInnerType) {
  const { rigidBodyRef, outerGroupRef } = props;
  // const { size } = useGltfAndSize({
  //   url: props.url,
  // });
  return (
    <OuterGroupRef ref={outerGroupRef}>
      <RigidBodyRef
        ref={rigidBodyRef}
        name={props.name}
        componentType={"vehicle"}
        ridingUrl={props.ridingUrl}
        {...props}
      >
        {/* <CuboidCollider
          args={[size.x / 2, size.y / 2, size.z / 2]}
          position={[0, size.y / 2, 0]}
        /> */}
        {/* {!props.wheelUrl === undefined && (
          <VehicleWheelCollider
            wheelUrl={props.wheelUrl}
            vehicleSize={vehicleSize}
          />
        )}
        {!props.url === undefined && (
          <VehicleCollider vehicleSize={vehicleSize} />
        )} */}

        {props.children}
      </RigidBodyRef>
      {/* {!props.wheelUrl === undefined && (
        <WheelsRef∂
          rigidBodyRef={rigidBodyRef}
          wheelUrl={props.wheelUrl}
          vehicleSize={vehicleSize}
        />
      )} */}
    </OuterGroupRef>
  );
}

```

### gaesup\component\inner\vehicle\wheels.tsx

```tsx
import { Gltf } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CylinderCollider,
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import { RefObject, createRef, useContext, useRef } from "react";
import * as THREE from "three";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { GaesupWorldContext } from "../../../world/context";

const WheelJoint = ({
  body,
  wheel,
  bodyAnchor,
  wheelAnchor,
  rotationAxis,
}: {
  body: RefObject<RapierRigidBody>;
  wheel: RefObject<RapierRigidBody>;
  bodyAnchor: [number, number, number];
  wheelAnchor: [number, number, number];
  rotationAxis: [number, number, number];
}) => {
  const joint = useRevoluteJoint(body, wheel, [
    bodyAnchor,
    wheelAnchor,
    rotationAxis,
  ]);
  const { activeState } = useContext(GaesupWorldContext);
  useFrame(() => {
    if (joint.current) {
      joint.current.configureMotorPosition(
        activeState.position.length(),
        0.8,
        0
      );
    }
  });
  return null;
};

export function WheelsRef({
  vehicleSize,
  rigidBodyRef,
  wheelUrl,
}: {
  vehicleSize: THREE.Vector3;
  rigidBodyRef: RefObject<RapierRigidBody>;
  wheelUrl: string;
}) {
  const { size: wheelSize } = useGltfAndSize({
    url: wheelUrl,
  });

  const X = (vehicleSize.x - wheelSize.x) / 2;
  const Z = (vehicleSize.z - 2 * wheelSize.z) / 2;
  const wheelPositions: [number, number, number][] = [
    [-X, 0, Z],
    [-X, 0, -Z],
    [X, 0, Z],
    [X, 0, -Z],
  ];
  const wheelRefs = useRef(
    wheelPositions.map(() => createRef<RapierRigidBody>())
  );

  return (
    <>
      {wheelRefs &&
        wheelPositions.map((wheelPosition, index) => {
          if (
            !wheelRefs ||
            !wheelRefs.current ||
            !wheelRefs.current[index] ||
            !wheelSize.x ||
            !wheelSize.y
          )
            return <></>;
          const wheelRef = wheelRefs.current[index];
          return (
            <RigidBody
              key={index}
              position={wheelPosition}
              colliders={false}
              type="dynamic"
              ref={wheelRef}
              rotation={[0, 0, Math.PI / 2]}
            >
              <CylinderCollider
                rotation={[0, 0, Math.PI / 2]}
                args={[wheelSize.x / 2, wheelSize.y / 2]}
              />
              <Gltf src={wheelUrl} />
            </RigidBody>
          );
        })}
      {wheelRefs &&
        wheelPositions.map((wheelPosition, index) => {
          if (
            !wheelRefs ||
            !wheelRefs.current ||
            !wheelRefs.current[index] ||
            !wheelSize.x ||
            !wheelSize.y
          )
            return <></>;
          const wheelRef = wheelRefs.current[index];
          return (
            <WheelJoint
              key={index}
              body={rigidBodyRef}
              wheel={wheelRef}
              bodyAnchor={wheelPosition}
              wheelAnchor={[0, 0, 0]}
              rotationAxis={[1, 0, 0]}
            />
          );
        })}
    </>
  );
}

```

### gaesup\component\passive\airplane\index.tsx

```tsx
import { useFrame } from '@react-three/fiber';
import { quat } from '@react-three/rapier';
import { useGenericRefs } from '../../inner/common/useGenericRefs';
import { passiveAirplanePropsType } from './type';
import { AirplaneInnerRef } from '../../inner/airplane';

export function PassiveAirplane(props: passiveAirplanePropsType) {
  // ★ 기존 4개 useRef -> 하나의 Hook으로
  const { rigidBodyRef, outerGroupRef, innerGroupRef, colliderRef } = useGenericRefs();

  // 기존: onFrame 등 그대로
  useFrame(() => {
    if (innerGroupRef.current) {
      const _euler = props.rotation.clone();
      _euler.y = 0;
      innerGroupRef.current.setRotationFromQuaternion(
        quat()
          .setFromEuler(innerGroupRef.current.rotation.clone())
          .slerp(quat().setFromEuler(_euler), 0.2),
      );
    }
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setGravityScale(
        props.position.y < 10 ? ((1 - 0.1) / (0 - 10)) * props.position.y + 1 : 0.1,
        false,
      );
    }
  });

  // 동일: refs 객체 통합
  const refs = {
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    colliderRef,
  };

  return (
    <AirplaneInnerRef
      isActive={false}
      componentType="airplane"
      name="airplane"
      {...props}
      {...refs}
    >
      {props.children}
    </AirplaneInnerRef>
  );
}

```

### gaesup\component\passive\character\index.tsx

```tsx
import { Collider } from '@dimforge/rapier3d-compat';
import { RapierRigidBody } from '@react-three/rapier';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CharacterInnerRef } from '../../inner/character';
import { innerRefType } from '../type';
import { passiveCharacterPropsType } from './type';

export function PassiveCharacter(props: passiveCharacterPropsType) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const colliderRef = useRef<Collider>(null);
  const refs: innerRefType = {
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    colliderRef,
  };

  useEffect(() => {
    if (rigidBodyRef && rigidBodyRef.current) {
      rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }, []);

  return (
    <CharacterInnerRef
      isActive={false}
      componentType={'character'}
      controllerOptions={
        props.controllerOptions || {
          lerp: {
            cameraTurn: 1,
            cameraPosition: 1,
          },
        }
      }
      position={props.position}
      rotation={props.rotation}
      groundRay={props.groundRay}
      currentAnimation={props.currentAnimation}
      {...refs}
      {...props}
    >
      {props.children}
    </CharacterInnerRef>
  );
}

```

### gaesup\component\passive\vehicle\index.tsx

```tsx
import { useGenericRefs } from '../../inner/common/useGenericRefs';
import { VehicleInnerRef } from '../../inner/vehicle';
import { passiveVehiclePropsType } from './type';

export function PassiveVehicle(props: passiveVehiclePropsType) {
  const { rigidBodyRef, outerGroupRef, innerGroupRef, colliderRef } = useGenericRefs();

  const refs = {
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    colliderRef,
  };

  return (
    <VehicleInnerRef isActive={false} componentType="vehicle" name="vehicle" {...props} {...refs}>
      {props.children}
    </VehicleInnerRef>
  );
}

```

### gaesup\controller\index.tsx

```tsx
'use client';
import * as THREE from 'three';
import { useRef, useReducer, useMemo } from 'react';
import { Collider } from '@dimforge/rapier3d-compat';
import { RapierRigidBody } from '@react-three/rapier';
import { useContextBridge } from '@react-three/drei';
import { GaesupWorldContext } from '../world/context';
import {
  GaesupControllerContext,
  GaesupControllerDispatchContext,
  gaesupControllerDefault,
} from './context';
import { gaesupControllerReducer } from './context/reducer';
import initControllerProps from './initialize';
import { GaesupComponent } from '../component';
import { controllerType, controllerInnerType } from './type';

export function GaesupController(props: controllerType) {
  return <GaesupControllerInner {...props}>{props.children}</GaesupControllerInner>;
}

export function GaesupControllerInner(props: controllerType) {
  const colliderRef = useRef<Collider>(null),
    rigidBodyRef = useRef<RapierRigidBody>(null),
    outerGroupRef = useRef<THREE.Group>(null),
    innerGroupRef = useRef<THREE.Group>(null),
    characterInnerRef = useRef<THREE.Group>(null),
    passiveRigidBodyRef = useRef<RapierRigidBody>(null);
  const [controller, controllerDispatch] = useReducer(gaesupControllerReducer, {
    airplane: { ...gaesupControllerDefault.airplane, ...props.airplane },
    vehicle: { ...gaesupControllerDefault.vehicle, ...props.vehicle },
    character: { ...gaesupControllerDefault.character, ...props.character },
    callbacks: {
      ...gaesupControllerDefault.callbacks,
      onReady: props.onReady,
      onFrame: props.onFrame,
      onDestory: props.onDestory,
      onAnimate: props.onAnimate,
    },
    refs: { colliderRef, rigidBodyRef, outerGroupRef, innerGroupRef, characterInnerRef },
    controllerOptions: { ...gaesupControllerDefault.controllerOptions, ...props.controllerOptions },
  });
  const gaesupControl = useMemo(
    () => ({ value: controller, dispatch: controllerDispatch }),
    [controller],
  );
  const refs = useMemo(
    () => ({
      colliderRef,
      rigidBodyRef,
      outerGroupRef,
      innerGroupRef,
      characterInnerRef,
      passiveRigidBodyRef,
    }),
    [],
  );
  const prop: controllerInnerType = {
    ...initControllerProps({ refs }),
    children: props.children,
    groupProps: props.groupProps,
    rigidBodyProps: props.rigidBodyProps,
    controllerOptions: gaesupControl.value.controllerOptions,
    parts: props.parts,
    ...gaesupControl.value.callbacks,
    ...refs,
  };
  const ContextBridge = useContextBridge(GaesupWorldContext, GaesupControllerContext);
  return (
    <ContextBridge>
      <GaesupControllerContext.Provider value={gaesupControl.value}>
        <GaesupControllerDispatchContext.Provider value={gaesupControl.dispatch}>
          <GaesupComponent props={prop} refs={refs} />
        </GaesupControllerDispatchContext.Provider>
      </GaesupControllerContext.Provider>
    </ContextBridge>
  );
}

```

### gaesup\gaesupProps\index.tsx

```tsx
import { vec3 } from '@react-three/rapier';
import { useContext, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useClicker } from '../hooks/useClicker';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../world/context';

export function GaeSupProps({
  type = 'normal',
  text,
  position,
  children,
}: {
  type?: 'normal' | 'ground';
  text?: string;
  position?: [number, number, number];
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { minimap } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { moveClicker } = useClicker();
  useEffect(() => {
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const size = vec3(box.getSize(new THREE.Vector3())).clone();
      const center = vec3(box.getCenter(new THREE.Vector3())).clone();
      const obj = {
        type: type ? type : 'normal',
        text,
        size,
        center,
      };
      minimap.props[text] = obj;
      dispatch({
        type: 'update',
        payload: {
          minimap: {
            ...minimap,
          },
        },
      });
    }
  }, []);

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={(e) => {
        if (e.srcElement instanceof HTMLDivElement) return;
        moveClicker(e, false, type);
      }}
    >
      {children}
    </group>
  );
}

```

### gaesup\hooks\useFocus\index.tsx

```tsx
import { useContext } from "react";
import * as THREE from "three";
import { makeNormalCameraPosition } from "../../camera/control/normal";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";

export function useFocus() {
  const { cameraOption, activeState, block } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const dispatchAsync = async () => {
    dispatch({
      type: "update",
      payload: {
        cameraOption: cameraOption,
      },
    });
  };

  const close = async () => {
    block.control = true;
    block.animation = true;
    dispatch({
      type: "update",
      payload: {
        block: block,
      },
    });
  };

  const open = async () => {
    block.control = false;
    block.animation = false;
    dispatch({
      type: "update",
      payload: {
        block: block,
      },
    });
  };

  const on = async () => {
    cameraOption.focus = true;

    dispatch({
      type: "update",
      payload: {
        cameraOption: cameraOption,
      },
    });
  };

  const off = async () => {
    cameraOption.focus = false;
    dispatch({
      type: "update",
      payload: {
        cameraOption: cameraOption,
      },
    });
  };

  const focus = async ({
    zoom,
    target,
    position,
  }: {
    zoom?: number;
    target: THREE.Vector3;
    position: THREE.Vector3;
  }) => {
    if (zoom) cameraOption.zoom = zoom;
    cameraOption.position.lerp(position, 0.1);
    cameraOption.target.lerp(target, 0.1);
  };

  const free = async ({ zoom }: { zoom?: number }) => {
    if (zoom) cameraOption.zoom = zoom;
    cameraOption.position.lerp(
      makeNormalCameraPosition(activeState, cameraOption),
      0.1
    );
    cameraOption.target.lerp(activeState.position.clone(), 0.1);
  };

  const move = async ({ newPosition }: { newPosition: THREE.Vector3 }) => {
    cameraOption.position.lerp(newPosition.clone(), 0.1);
  };

  const focusOn = async ({
    zoom,
    target,
    position,
  }: {
    zoom?: number;
    target: THREE.Vector3;
    position: THREE.Vector3;
  }) => {
    await close();
    await on();
    await move({ newPosition: position });

    await focus({ zoom, target, position });
    await dispatchAsync();
  };

  const focusOff = async ({ zoom }: { zoom?: number }) => {
    await open();
    await off();
    await move({
      newPosition: makeNormalCameraPosition(activeState, cameraOption),
    });
    await free({ zoom });
    await dispatchAsync();
  };

  return {
    open,
    close,
    on,
    off,
    focus,
    free,
    focusOn,
    focusOff,
  };
}

```

### gaesup\hooks\useGaesupAnimation\index.tsx

```tsx
import { useContext } from "react";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";
import { animationAtomType } from "../../world/context/type";

export function useGaesupAnimation({
  type,
}: {
  type: "character" | "vehicle" | "airplane";
}) {
  const { animationState } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const getAnimationTag = (tag: string): { name: string; isValid: boolean } => {
    const animation: animationAtomType = animationState[type].store[tag];
    if (!animation)
      return { name: animationState[type].default, isValid: false };
    if (animation.condition()) {
      return { name: animation.animationName, isValid: true };
    } else {
      return { name: animationState[type].default, isValid: false };
    }
  };

  const notify = () => {
    let tag = animationState[type].default;
    for (const key of Object.keys(animationState[type].store)) {
      const checked = getAnimationTag(key);
      if (checked.isValid) {
        tag = checked.name;
        break;
      }
    }
    animationState[type].current = tag;
    dispatch({
      type: "update",
      payload: {
        animationState: {
          ...animationState,
        },
      },
    });
    return tag;
  };

  const unsubscribe = (tag: string) => {
    delete animationState[type].store[tag];
    dispatch({
      type: "update",
      payload: {
        animationState: {
          ...animationState,
        },
      },
    });
  };

  const subscribe = ({
    tag,
    condition,
    action,
    animationName,
    key,
  }: animationAtomType) => {
    animationState[type].store[tag] = {
      condition,
      action: action || (() => {}),
      animationName: animationName || tag,
      key: key || tag,
    };
    dispatch({
      type: "update",
      payload: {
        animationState: {
          ...animationState,
        },
      },
    });
  };

  const subscribeAll = (props: animationAtomType[]) => {
    const subscribedTags: string[] = [];

    props.forEach((item) => {
      animationState[type].store[item.tag] = {
        condition: item.condition,
        action: item.action,
        animationName: item.animationName,
        key: item.key,
      };
      subscribedTags.push(item.tag);
    });

    dispatch({
      type: "update",
      payload: {
        animationState: {
          ...animationState,
        },
      },
    });

    // 구독 해제 함수 반환
    return () => {
      subscribedTags.forEach((tag) => {
        delete animationState[type].store[tag];
      });
      dispatch({
        type: "update",
        payload: {
          animationState: {
            ...animationState,
          },
        },
      });
    };
  };

  return {
    subscribe,
    subscribeAll,
    store: animationState?.[type].store,
    unsubscribe,
    notify,
  };
}

```

### gaesup\hooks\useGaesupGltf\index.tsx

```tsx
import { useGLTF } from "@react-three/drei";
import { useContext } from "react";
import * as THREE from "three";
import { GLTFResult } from "../../component/type";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";
import { urlsType } from "../../world/context/type";

export type gltfAndSizeType = {
  size: THREE.Vector3;
  setSize: (size: THREE.Vector3, keyName?: string) => void;
  getSize: () => THREE.Vector3;
};

export type useGltfAndSizeType = {
  url: string;
};

export const useGltfAndSize = ({ url }: useGltfAndSizeType) => {
  const { sizes } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const gltf = useGLTF(url) as GLTFResult;
  const { scene } = gltf;

  const makeGltfSize = () => {
    return new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
  };
  // getter
  const getSize = (keyName?: string) => {
    const key = keyName || url;
    if (key in sizes) {
      return sizes[key];
    } else {
      return null;
    }
  };
  // setter
  const setSize = (size?: THREE.Vector3, keyName?: string) => {
    const key = keyName || url;
    if (!(key in sizes)) {
      sizes[key] = size || makeGltfSize();
      dispatch({
        type: "update",
        payload: {
          sizes: { ...sizes },
        },
      });
      return sizes[key];
    } else {
      return sizes[key];
    }
  };

  return { gltf, size: setSize(), setSize, getSize };
};

export const useGaesupGltf = () => {
  const { sizes } = useContext(GaesupWorldContext);

  // get size by url
  const getSizesByUrls = (urls?: urlsType) => {
    const matchedSizes: { [key in keyof urlsType]: THREE.Vector3 } = {};
    if (!urls) return matchedSizes;
    Object.keys(urls).forEach((key) => {
      const url = urls[key];
      if (url in sizes) {
        matchedSizes[key] = sizes[url];
      } else {
        matchedSizes[key] = null;
      }
    });
    return matchedSizes;
  };

  return { getSizesByUrls };
};

```

### gaesup\hooks\useRideable\index.tsx

```tsx
import { CollisionEnterPayload, euler, vec3 } from "@react-three/rapier";
import { useContext } from "react";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";
import { useGaesupGltf } from "../useGaesupGltf";
import { rideableType } from "./type";

export const rideableDefault = {
  objectkey: null,
  objectType: null,
  isRiderOn: false,
  url: null,
  wheelUrl: null,
  position: vec3(),
  rotation: euler(),
  offset: vec3(),
  visible: true,
};

export function useRideable() {
  const worldContext = useContext(GaesupWorldContext);
  const { urls, states, rideable, mode } = worldContext;
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { getSizesByUrls } = useGaesupGltf();

  const initRideable = (props: rideableType) => {
    rideable[props.objectkey] = {
      ...rideableDefault,
      ...props,
    };
  };

  const setRideable = (props: rideableType) => {
    rideable[props.objectkey] = props;
  };

  const getRideable = (objectkey: string): rideableType => {
    return rideable[objectkey];
  };

  const landing = (objectkey: string) => {
    const { activeState, refs } = worldContext;
    states.enableRiding = false;
    states.isRiderOn = false;
    states.rideableId = null;
    const modeType = rideable[objectkey].objectType;
    const { vehicleUrl, airplaneUrl, characterUrl } = getSizesByUrls(urls);
    const size = modeType === "vehicle" ? vehicleUrl : airplaneUrl;
    const mySize = characterUrl;
    rideable[objectkey].visible = true;
    rideable[objectkey].position.copy(activeState.position.clone());
    if (refs && refs.rigidBodyRef) {
      refs.rigidBodyRef.current.setTranslation(
        activeState.position
          .clone()
          .add(size.clone().add(mySize.clone()).addScalar(1)),
        false
      );
    }
    dispatch({
      type: "update",
      payload: {
        rideable: { ...rideable },
        states: { ...states },
        activeState: { ...activeState },
      },
    });
  };

  const setUrl = async (props: rideableType) => {
    urls.ridingUrl = props.ridingUrl || urls.characterUrl || null;
    if (props.objectType === "vehicle") {
      urls.vehicleUrl = props.url;
      urls.wheelUrl = props.wheelUrl || null;
    } else if (props.objectType === "airplane") {
      urls.airplaneUrl = props.url;
    }

    dispatch({
      type: "update",
      payload: {
        urls: {
          ...urls,
        },
      },
    });
  };

  const setModeAndRiding = async (props: rideableType) => {
    mode.type = props.objectType;
    states.enableRiding = props.enableRiding;
    states.isRiderOn = true;

    states.rideableId = props.objectkey;
    rideable[props.objectkey].visible = false;
    dispatch({
      type: "update",
      payload: {
        mode: { ...mode },
        states: { ...states },
      },
    });
  };

  const ride = async (e: CollisionEnterPayload, props: rideableType) => {
    if (e.other.rigidBodyObject.name === "character") {
      await setUrl(props);
      await setModeAndRiding(props);
    }
  };

  return {
    initRideable,
    setRideable,
    getRideable,
    ride,
    landing,
  };
}

```

### gaesup\hooks\useTeleport\index.tsx

```tsx
import { useContext } from "react";
import * as THREE from "three";
import { GaesupWorldContext } from "../../world/context";

export function useTeleport() {
  const worldContext = useContext(GaesupWorldContext);

  const Teleport = (position: THREE.Vector3) => {
    if (
      worldContext &&
      worldContext?.refs &&
      worldContext?.refs?.rigidBodyRef &&
      worldContext?.refs?.rigidBodyRef?.current
    )
      worldContext.refs.rigidBodyRef.current.setTranslation(position, true);
  };

  return {
    Teleport,
  };
}

```

### gaesup\hooks\useZoom\index.tsx

```tsx
import { useContext } from "react";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";

export function useZoom() {
  const { cameraOption } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const zoom = (zoom: number) => {
    cameraOption.zoom = zoom;
    dispatch({
      type: "update",
      payload: {
        cameraOption: cameraOption,
      },
    });
  };

  return {
    zoom,
  };
}

```

### gaesup\physics\airplane\index.tsx

```tsx
import { calcType } from "../type";
import damping from "./damping";
import direction from "./direction";
import gravity from "./gravity";
import impulse from "./impulse";
import innerCalc from "./innerCalc";
import landing from "./landing";

export default function airplaneCalculation(calcProp: calcType) {
  direction(calcProp);
  impulse(calcProp);
  damping(calcProp);
  gravity(calcProp);
  landing(calcProp);
  innerCalc(calcProp);
}

```

### gaesup\physics\character\index.tsx

```tsx
import { calcType } from '../type';
import direction from './direction';
import impulse from './impulse';
import innerCalc from './innerCalc';
import queue from './queue';
import stop from './stop';

export default function characterCalculation(calcProp: calcType) {
  direction(calcProp);
  impulse(calcProp);
  innerCalc(calcProp);
  stop(calcProp);
  queue(calcProp);
}

```

### gaesup\physics\vehicle\index.tsx

```tsx
import { calcType } from "../type";
import damping from "./damping";
import direction from "./direction";
import impulse from "./impulse";
import innerCalc from "./innerCalc";
import landing from "./landing";

export default function vehicleCalculation(calcProp: calcType) {
  direction(calcProp);
  impulse(calcProp);
  damping(calcProp);
  landing(calcProp);
  innerCalc(calcProp);
}

```

### gaesup\tools\clicker\index.tsx

```tsx
import { Line } from '@react-three/drei';
import { ReactNode, useContext } from 'react';
import * as THREE from 'three';
import { GaesupWorldContext } from '../../world/context';

export function Clicker({ onMarker, runMarker }: { onMarker: ReactNode; runMarker: ReactNode }) {
  const { clicker, mode, clickerOption } = useContext(GaesupWorldContext);
  const pointQ = [];
  for (let i = 0; i < clickerOption.queue.length; i++) {
    if (clickerOption.queue[i] instanceof THREE.Vector3) {
      pointQ.push(clickerOption.queue[i]);
    }
  }

  return (
    <>
      {mode.controller === 'clicker' && (
        <group position={clicker.point}>
          {clicker.isOn && onMarker}
          {clicker.isOn && clickerOption.isRun && clicker.isRun && runMarker}
        </group>
      )}
      {clickerOption.line &&
        pointQ.map((queueItem, key) => {
          if (queueItem instanceof THREE.Vector3) {
            const current = key;
            const before = key === 0 ? pointQ.length - 1 : key - 1;

            return (
              <group position={[0, 1, 0]} key={key}>
                <Line
                  worldUnits
                  points={[pointQ[before], pointQ[current]]}
                  color="turquoise"
                  transparent
                  opacity={0.5}
                  lineWidth={0.4}
                />

                <mesh key={key} position={queueItem}>
                  <sphereGeometry args={[0.6, 30, 0.6]} />
                  <meshStandardMaterial color="turquoise" transparent opacity={0.8} />
                </mesh>
              </group>
            );
          }
        })}
    </>
  );
}

```

### gaesup\tools\gamepad\GamePadButton.tsx

```tsx
import { useState } from 'react';
import { usePushKey } from '../../hooks/usePushKey';
import * as S from './style.css';
import { GamePadButtonType } from './type';

export default function GamePadButton({ value, name, gamePadButtonStyle }: GamePadButtonType) {
  const [isClicked, setIsClicked] = useState(false);
  const { pushKey } = usePushKey();

  const onMouseDown = () => {
    pushKey(value, true);
    setIsClicked(true);
  };

  const onMouseLeave = () => {
    pushKey(value, false);
    setIsClicked(false);
  };

  return (
    <button
      className={`${S.padButton} ${isClicked ? S.isClicked : ''}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseLeave}
      onMouseLeave={onMouseLeave}
      onContextMenu={(e) => {
        e.preventDefault();
        onMouseLeave();
      }}
      onPointerDown={onMouseDown}
      onPointerUp={onMouseLeave}
      style={gamePadButtonStyle}
    >
      {name}
    </button>
  );
}

```

### gaesup\tools\gamepad\index.tsx

```tsx
// GamePad.tsx
import { useContext } from 'react';
import { GaesupWorldContext } from '../../world/context';
import GamePadButton from './GamePadButton';
import * as S from './style.css';
import { gameBoyDirectionType, gamepadType } from './type';

export const gamepadDefault = {
  on: true,
};

export function GamePad(props: gamepadType) {
  const { gamePadStyle, gamePadButtonStyle, label } = props;
  const { control, mode } = useContext(GaesupWorldContext);
  const GamePadDirections = Object.keys(control)
    .map((key) => {
      const name = label?.[key] || key;
      if (key !== 'forward' && key !== 'backward' && key !== 'leftward' && key !== 'rightward')
        return {
          tag: key,
          value: key,
          name: name,
        };
    })
    .filter((item) => item !== undefined)
    .filter((item: gameBoyDirectionType) => !(item.tag === 'run'));

  return (
    <>
      {mode.controller === 'clicker' && (
        <div className={S.gamePad} style={gamePadStyle}>
          {GamePadDirections.map((item: gameBoyDirectionType, key: number) => {
            return (
              <GamePadButton
                key={key}
                value={item.value}
                name={item.name}
                gamePadButtonStyle={gamePadButtonStyle}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

```

### gaesup\tools\minimap\index.tsx

```tsx
// import { useCallback, useContext, useState } from 'react';
// import { GaesupWorldContext } from '../../world/context';
// import * as S from './style.css';
//
// // X 축은 동(+) 서(-) 방향, 즉 경도를 나타낸다.
// // Z 축은 남(+) 북(-) 방향, 즉 위도를 나타낸다.
//
// export const minimapDefault = {
//   scale: 0.5,
//   minScale: 0.1,
//   maxScale: 2,
//   blockScale: false,
// };
//
// export const minimapInnerDefault = {
//   props: {},
// };
//
// export function MiniMap(props: any) {
//   const { minimap, activeState, mode } = useContext(GaesupWorldContext);
//   const [scale, setscale] = useState(props.scale || minimapDefault.scale);
//   const {
//     minimapInnerStyle,
//     textStyle,
//     minimapObjectStyle,
//     avatarStyle,
//     scaleStyle,
//     directionStyle,
//     plusMinusStyle,
//     imageStyle,
//     minimapStyle,
//     minimapOuterStyle,
//   } = props;
//
//   const upscale = useCallback(() => {
//     const max = props.maxScale || minimapDefault.maxScale;
//     setscale((scale) => Math.min(max, scale + 0.1));
//   }, [props.maxScale]);
//
//   const downscale = useCallback(() => {
//     const min = props.minScale || minimapDefault.minScale;
//     setscale((scale) => Math.max(min, scale - 0.1));
//   }, [props.minScale]);
//
//   return (
//     <div
//       className={S.minimap}
//       onWheel={(e) => {
//         if (props.blockScale) return;
//         if (e.deltaY <= 0) upscale();
//         else downscale();
//       }}
//       style={minimapStyle}
//     >
//       <div className={S.minimapOuter} style={minimapOuterStyle} />
//
//       <div
//         className={S.minimapInner}
//         style={{
//           transform:
//             props.blockRotate || mode.control === 'normal'
//               ? `translate(-50%, -50%) rotate(180deg)`
//               : `translate(-50%, -50%) rotate(${(activeState.euler.y * 180) / Math.PI + 180}deg)`,
//           ...minimapInnerStyle,
//         }}
//       >
//         <div
//           className={S.east}
//           style={{
//             transform:
//               props.blockRotate || mode.control === 'normal'
//                 ? `translate(-50%, -50%) rotate(180deg)`
//                 : `translate(-50%, -50%) rotate(-${
//                     (activeState.euler.y * 180) / Math.PI + 180
//                   }deg)`,
//             ...directionStyle,
//           }}
//         >
//           E
//         </div>
//         <div
//           className={S.west}
//           style={{
//             transform:
//               props.blockRotate || mode.control === 'normal'
//                 ? `translate(50%, -50%) rotate(180deg)`
//                 : `translate(50%, -50%) rotate(-${(activeState.euler.y * 180) / Math.PI + 180}deg)`,
//             ...directionStyle,
//           }}
//         >
//           W
//         </div>
//         <div
//           className={S.south}
//           style={{
//             transform:
//               props.blockRotate || mode.control === 'normal'
//                 ? `translate(-50%, 50%) rotate(180deg)`
//                 : `translate(-50%, 50%) rotate(-${(activeState.euler.y * 180) / Math.PI + 180}deg)`,
//             ...directionStyle,
//           }}
//         >
//           S
//         </div>
//         <div
//           className={S.north}
//           style={{
//             transform:
//               props.blockRotate || mode.control === 'normal'
//                 ? `translate(-50%, -50%) rotate(180deg)`
//                 : `translate(-50%, -50%) rotate(-${
//                     (activeState.euler.y * 180) / Math.PI + 180
//                   }deg)`,
//             ...directionStyle,
//           }}
//         >
//           N
//         </div>
//         {Object.values(minimap.props).map(({ center, size, text }, key) => {
//           const X =
//             (center.x - activeState.position.x) * (props.angle ? Math.sin(props.angle) : 1) * scale;
//           const Z =
//             (center.z - activeState.position.z) *
//             (props.angle ? -Math.cos(props.angle) : 1) *
//             scale;
//           return (
//             <div key={key}>
//               <div
//                 className={S.minimapObject}
//                 style={{
//                   width: `${size.x * scale}rem`,
//                   height: `${size.z * scale}rem`,
//                   top: '50%',
//                   left: '50%',
//                   transform: `translate(-50.1%, -50.1%) translate(${-X}rem, ${-Z}rem) rotate(${
//                     (Math.PI * 3) / 2 + props.angle || 0
//                   }rad)`,
//                   transformOrigin: '50% 50%',
//                   zIndex: 1 + key,
//                   ...minimapObjectStyle,
//                 }}
//               ></div>
//               {key === 0 && (
//                 <div
//                   className={S.imageObject}
//                   style={{
//                     width: `${size.x * scale}rem`,
//                     height: `${size.z * scale}rem`,
//                     top: '50%',
//                     left: '50%',
//                     transform: `translate(-50.1%, -50.1%) translate(${-X}rem, ${-Z}rem) rotate(${
//                       (Math.PI * 3) / 2 + props.angle || 0
//                     }rad)`,
//                     transformOrigin: '50% 50%',
//                     zIndex: 10 + key,
//                     ...imageStyle,
//                   }}
//                 ></div>
//               )}
//               <div
//                 className={S.textObject}
//                 style={{
//                   width: `${size.x * scale}rem`,
//                   height: `${size.z * scale}rem`,
//                   top: '50.1%',
//                   left: '50.1%',
//                   transform: `translate(-50.1%, -50.1%) translate(${-X}rem, ${-Z}rem)`,
//                   transformOrigin: '50.1% 50.1%',
//                   zIndex: 1001 + key,
//                 }}
//               >
//                 {text && (
//                   <div
//                     className={S.text}
//                     style={{
//                       ...textStyle,
//                       zIndex: 1001 + key,
//                       transform:
//                         props.blockRotate || mode.control === 'normal'
//                           ? `rotate(180deg)`
//                           : `rotate(-${(activeState.euler.y * 180) / Math.PI + 180}deg)`,
//                     }}
//                   >
//                     {text}
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//         <div className={S.avatar} style={avatarStyle} />
//       </div>
//
//       {!props.blockScaleControl && (
//         <div className={S.scale} style={scaleStyle}>
//           <div
//             className={S.plusMinus}
//             style={plusMinusStyle}
//             onClick={() => {
//               if (props.blockScale) return;
//               downscale();
//             }}
//           >
//             +
//           </div>
//           SCALE 1:{Math.round(100 / scale)}
//           <div
//             className={S.plusMinus}
//             style={plusMinusStyle}
//             onClick={() => {
//               if (props.blockScale) return;
//               upscale();
//             }}
//           >
//             -
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { GaesupWorldContext } from '../../world/context';
import { MinimapProps } from './type';
import {
  baseStyles,
  MINIMAP_SIZE_PX,
  directionStyles,
  objectStyles,
  avatarStyles,
  textStyles,
} from './style.css';

const DEFAULT_SCALE = 0.5;
const MIN_SCALE = 0.1;
const MAX_SCALE = 2;

export function MiniMap({
  scale: initialScale = DEFAULT_SCALE,
  minScale = MIN_SCALE,
  maxScale = MAX_SCALE,
  blockScale = false,
  blockScaleControl = false,
  blockRotate = false,
  angle = 0,
  minimapStyle,
  minimapInnerStyle,
  textStyle,
  minimapObjectStyle,
  avatarStyle,
  scaleStyle,
  directionStyle,
  plusMinusStyle,
  imageStyle,
}: MinimapProps) {
  const { minimap, activeState, mode } = useContext(GaesupWorldContext);
  const [scale, setScale] = React.useState(initialScale);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const upscale = useCallback(() => {
    if (blockScale) return;
    setScale((prev) => Math.min(maxScale, prev + 0.1));
  }, [blockScale, maxScale]);

  const downscale = useCallback(() => {
    if (blockScale) return;
    setScale((prev) => Math.max(minScale, prev - 0.1));
  }, [blockScale, minScale]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (blockScale) return;
      if (e.deltaY < 0) upscale();
      else downscale();
    },
    [blockScale, upscale, downscale],
  );

  const getRotation = useCallback(() => {
    if (blockRotate || mode.control === 'normal') return 180;
    return (activeState.euler.y * 180) / Math.PI + 180;
  }, [blockRotate, mode.control, activeState.euler.y]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeState?.position || !minimap?.props) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and setup
    ctx.clearRect(0, 0, MINIMAP_SIZE_PX, MINIMAP_SIZE_PX);

    // Apply circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, MINIMAP_SIZE_PX, MINIMAP_SIZE_PX);

    // Setup rotation
    const rotation = getRotation();
    ctx.translate(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-MINIMAP_SIZE_PX / 2, -MINIMAP_SIZE_PX / 2);

    // Draw direction markers
    const drawDirections = () => {
      ctx.save();
      ctx.fillStyle = directionStyle?.color || directionStyles.color;
      ctx.font = `${directionStyle?.fontSize || directionStyles.fontSize} sans-serif`;

      const dirs = [
        { text: 'N', x: MINIMAP_SIZE_PX / 2, y: 30 },
        { text: 'S', x: MINIMAP_SIZE_PX / 2, y: MINIMAP_SIZE_PX - 30 },
        { text: 'E', x: MINIMAP_SIZE_PX - 30, y: MINIMAP_SIZE_PX / 2 },
        { text: 'W', x: 30, y: MINIMAP_SIZE_PX / 2 },
      ];

      dirs.forEach(({ text, x, y }) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((-rotation * Math.PI) / 180);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
        ctx.restore();
      });

      ctx.restore();
    };

    drawDirections();

    // Draw minimap objects
    Object.values(minimap.props).forEach((obj, index) => {
      const { center, size, text } = obj;

      // Calculate position
      const posX = (center.x - activeState.position.x) * (angle ? Math.sin(angle) : 1) * scale;
      const posZ = (center.z - activeState.position.z) * (angle ? -Math.cos(angle) : 1) * scale;

      // Draw object
      ctx.save();
      ctx.fillStyle = minimapObjectStyle?.background || objectStyles.background;
      const width = size.x * scale;
      const height = size.z * scale;
      const x = MINIMAP_SIZE_PX / 2 - posX - width / 2;
      const y = MINIMAP_SIZE_PX / 2 - posZ - height / 2;
      ctx.fillRect(x, y, width, height);

      // Draw text if present
      if (text) {
        ctx.save();
        ctx.fillStyle = textStyle?.color || textStyles.color;
        ctx.font = `${textStyle?.fontSize || textStyles.fontSize} sans-serif`;
        ctx.translate(x + width / 2, y + height / 2);
        if (blockRotate || mode.control === 'normal') {
          ctx.rotate(Math.PI);
        } else {
          ctx.rotate((-rotation * Math.PI) / 180);
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }

      ctx.restore();
    });

    // Draw avatar
    ctx.save();
    ctx.fillStyle = avatarStyle?.background || avatarStyles.background;
    ctx.shadowColor = avatarStyle?.boxShadow || avatarStyles.boxShadow;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }, [
    minimap,
    activeState,
    scale,
    angle,
    blockRotate,
    mode.control,
    getRotation,
    minimapObjectStyle,
    textStyle,
    avatarStyle,
    directionStyle,
  ]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE_PX}
        height={MINIMAP_SIZE_PX}
        style={{
          ...baseStyles.minimap,
          ...minimapStyle,
        }}
        onWheel={handleWheel}
      />
      {!blockScaleControl && (
        <div
          style={{
            ...baseStyles.scale,
            ...scaleStyle,
          }}
        >
          <div
            style={{
              ...baseStyles.plusMinus,
              cursor: blockScale ? 'default' : 'pointer',
              ...plusMinusStyle,
            }}
            onClick={downscale}
          >
            +
          </div>
          <span>SCALE 1:{Math.round(100 / scale)}</span>
          <div
            style={{
              ...baseStyles.plusMinus,
              cursor: blockScale ? 'default' : 'pointer',
              ...plusMinusStyle,
            }}
            onClick={upscale}
          >
            -
          </div>
        </div>
      )}
    </div>
  );
}

```

### gaesup\tools\rideable\index.tsx

```tsx
import { euler, CollisionEnterPayload } from '@react-three/rapier';
import { useContext, useState, useEffect } from 'react';
import { useRideable } from '../../hooks/useRideable';
import { V3 } from '../../utils';
import { GaesupWorldContext } from '../../world/context';
import { rideablePropType } from './type';
import * as THREE from 'three';
import { PassiveAirplane } from '../../component/passive/airplane';
import { PassiveVehicle } from '../../component/passive/vehicle';

export function Rideable(props: rideablePropType) {
  const { states, rideable } = useContext(GaesupWorldContext);
  const { initRideable, ride, landing } = useRideable();
  const [_rideable] = useState<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
  }>({
    position: props.position || V3(0, 0, 0),
    rotation: props.rotation || euler(),
  });

  useEffect(() => {
    initRideable(props);
  }, []);

  useEffect(() => {
    if (states?.isRiding && rideable[props.objectkey] && !rideable[props.objectkey].visible) {
      landing(props.objectkey);
    }
  }, [states?.isRiding]);

  const onIntersectionEnter = async (e: CollisionEnterPayload) => {
    await ride(e, props);
  };

  return (
    <>
      {rideable?.[props.objectkey]?.visible && (
        <group userData={{ intangible: true }}>
          {props.objectType === 'vehicle' && (
            <PassiveVehicle
              controllerOptions={props.controllerOptions}
              position={_rideable.position}
              rotation={_rideable.rotation}
              currentAnimation={'idle'}
              url={props.url}
              wheelUrl={props.wheelUrl}
              ridingUrl={props.ridingUrl}
              offset={props.offset}
              enableRiding={props.enableRiding}
              rigidBodyProps={props.rigidBodyProps}
              sensor={true}
              onIntersectionEnter={onIntersectionEnter}
            />
          )}
          {props.objectType === 'airplane' && (
            <PassiveAirplane
              controllerOptions={props.controllerOptions}
              position={_rideable.position.clone()}
              rotation={_rideable.rotation.clone()}
              currentAnimation={'idle'}
              url={props.url}
              ridingUrl={props.ridingUrl}
              offset={props.offset}
              enableRiding={props.enableRiding}
              rigidBodyProps={props.rigidBodyProps}
              sensor={true}
              onIntersectionEnter={onIntersectionEnter}
            />
          )}
        </group>
      )}
    </>
  );
}

```

### gaesup\tools\teleport\index.tsx

```tsx
// teleport.tsx
import { useTeleport } from "../../hooks/useTeleport";
import * as S from "./style.css";
import { teleportType } from "./type.ts";

export function teleport({ text, position, teleportStyle }: teleportType) {
  const { Teleport } = useTeleport();

  return (
    <div
      className={S.teleport}
      onClick={() => {
        Teleport(position);
      }}
      style={teleportStyle}
    >
      {text}
    </div>
  );
}

```

### gaesup\utils\innerHtml.tsx

```tsx
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

export function InnerHtml({ children, ...props }) {
  const ref = useRef<THREE.Group>();
  const [isInRange, setInRange] = useState<boolean>();
  const vec = new THREE.Vector3();
  useFrame((state) => {
    const range =
      state.camera.position.distanceTo(ref.current.getWorldPosition(vec)) <= 10;
    if (range !== isInRange) setInRange(range);
  });
  return (
    <group ref={ref}>
      <Html transform occlude {...props}>
        {children}
      </Html>
    </group>
  );
}

```

### gaesup\world\index.tsx

```tsx
'use client';

import { GaesupWorldContext, GaesupWorldDispatchContext } from './context';
import initGaesupWorld from './initalize';
import { gaesupWorldPropsType } from './type';

export function GaesupWorld(props: gaesupWorldPropsType) {
  const { gaesupProps } = initGaesupWorld(props);

  return (
    <GaesupWorldContext.Provider value={gaesupProps.value}>
      <GaesupWorldDispatchContext.Provider value={gaesupProps.dispatch}>
        {props.children}
      </GaesupWorldDispatchContext.Provider>
    </GaesupWorldContext.Provider>
  );
}

```


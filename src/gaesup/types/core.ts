import { Collider } from '@dimforge/rapier3d-compat';
import { GroupProps } from '@react-three/fiber';
import { RapierRigidBody, RigidBodyProps } from '@react-three/rapier';
import { Dispatch, ReactNode, RefObject } from 'react';
import * as THREE from 'three';

export namespace GaesupCore {
  /**
   * 기본 벡터 인터페이스
   */
  export interface Vector3Like {
    x: number;
    y: number;
    z: number;
  }

  /**
   * 오일러 각도 인터페이스
   */
  export interface EulerLike extends Vector3Like {
    order?: string;
  }

  /**
   * 쿼터니언 인터페이스
   */
  export interface QuaternionLike {
    x: number;
    y: number;
    z: number;
    w: number;
  }

  /**
   * 크기 인터페이스
   */
  export interface SizeType {
    x: number;
    y: number;
    z: number;
  }

  /**
   * 디스패치 액션
   */
  export type DispatchAction<T> = {
    type: string;
    payload?: Partial<T>;
  };

  export type DispatchType<T> = Dispatch<DispatchAction<T>>;
  export namespace State {
    export interface Active {
      position: THREE.Vector3;
      velocity: THREE.Vector3;
      quat: THREE.Quaternion;
      euler: THREE.Euler;
      direction: THREE.Vector3;
      dir: THREE.Vector3;
    }
    export interface Passive {
      position: THREE.Vector3;
      quat: THREE.Quaternion;
      euler: THREE.Euler;
      rotation: THREE.Euler;
    }
    export interface Game {
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
      isLanding: boolean;
      isFalling: boolean;
      isRiding: boolean;
      canRide?: boolean;
      nearbyRideable?: NearbyRideable | null;
      shouldEnterRideable?: boolean;
      shouldExitRideable?: boolean;
    }
    export interface NearbyRideable {
      objectkey: string;
      objectType: 'vehicle' | 'airplane';
      name: string;
    }
    export interface Block {
      camera: boolean;
      control: boolean;
      animation: boolean;
      scroll: boolean;
    }
  }
  export namespace Input {
    export interface Keyboard {
      forward: boolean;
      backward: boolean;
      leftward: boolean;
      rightward: boolean;
      shift: boolean;
      space: boolean;
      keyZ: boolean;
      keyR: boolean;
      keyF: boolean;
      keyE: boolean;
      escape: boolean;
    }

    /**
     * 마우스/포인터 입력 상태
     */
    export interface Mouse {
      target: THREE.Vector3;
      angle: number;
      isActive: boolean;
      shouldRun: boolean;
    }

    /**
     * 게임패드 입력 상태
     */
    export interface Gamepad {
      connected: boolean;
      leftStick: { x: number; y: number };
      rightStick: { x: number; y: number };
      buttons: Record<string, boolean>;
    }

    /**
     * 클리커 옵션 상태
     */
    export interface ClickerOption {
      isRun: boolean;
      throttle: number;
      autoStart: boolean;
      track: boolean;
      loop: boolean;
      queue: THREE.Vector3[];
      line: boolean;
    }

    /**
     * 통합 입력 상태
     */
    export interface Unified {
      keyboard: Keyboard;
      pointer: Mouse;
      gamepad: Gamepad;
      blocks: State.Block;
      clickerOption: ClickerOption;
    }

    /**
     * 제어 상태 (간소화된 키보드)
     */
    export type Control = {
      forward: boolean;
      backward: boolean;
      leftward: boolean;
      rightward: boolean;
      shift?: boolean;
      space?: boolean;
      [key: string]: boolean | undefined;
    };

    /**
     * 키보드 제어 상태 (제네릭)
     */
    export type KeyboardControl<T extends string = string> = {
      [K in T]: boolean;
    };
  }

  export namespace Config {
    /**
     * 컨트롤러 설정
     */
    export interface Controller {
      lerp: {
        cameraTurn: number;
        cameraPosition: number;
      };
    }

    /**
     * 캐릭터 물리 설정
     */
    export interface Character {
      walkSpeed?: number;
      runSpeed?: number;
      turnSpeed?: number;
      jumpSpeed?: number;
      linearDamping?: number;
      jumpGravityScale?: number;
      normalGravityScale?: number;
      airDamping?: number;
      stopDamping?: number;
    }

    /**
     * 차량 물리 설정
     */
    export interface Vehicle {
      maxSpeed?: number;
      accelRatio?: number;
      brakeRatio?: number;
      wheelOffset?: number;
      linearDamping?: number;
    }

    /**
     * 비행기 물리 설정
     */
    export interface Airplane {
      angleDelta?: THREE.Vector3;
      maxAngle?: THREE.Vector3;
      maxSpeed?: number;
      accelRatio?: number;
      brakeRatio?: number;
      buoyancy?: number;
      linearDamping?: number;
    }
  }

  export namespace Controller {
    /**
     * 컨트롤러 타입
     */
    export type Type = 'character' | 'vehicle' | 'airplane';

    /**
     * 카메라 제어 모드
     */
    export type CameraControlMode =
      | 'firstPerson'
      | 'thirdPerson'
      | 'chase'
      | 'topDown'
      | 'sideScroll'
      | 'isometric'
      | 'free';

    /**
     * 제어 모드
     */
    export type ControlMode = 'normal' | 'chase';

    /**
     * 컨트롤러 모드
     */
    export type Mode = 'clicker';

    /**
     * 모드 타입
     */
    export type ModeType = {
      type?: Type;
      controller?: Mode;
      control?: CameraControlMode | ControlMode;
      isButton?: boolean;
    };
  }

  export namespace Refs {
    /**
     * 주요 참조들
     */
    export interface Main {
      colliderRef: RefObject<Collider>;
      rigidBodyRef: RefObject<RapierRigidBody>;
      outerGroupRef: RefObject<THREE.Group>;
      innerGroupRef: RefObject<THREE.Group>;
      characterInnerRef: RefObject<THREE.Group>;
    }

    /**
     * 기타 컨트롤러 Props
     */
    export interface ControllerOtherProp extends RigidBodyProps {
      children?: ReactNode;
      groupProps?: GroupProps;
      rigidBodyProps?: RigidBodyProps;
      debug?: boolean;
    }
  }

  export namespace Resource {
    /**
     * 리소스 URL들
     */
    export interface Urls {
      characterUrl?: string;
      vehicleUrl?: string;
      airplaneUrl?: string;
      wheelUrl?: string;
      ridingUrl?: string;
    }

    /**
     * 크기 맵
     */
    export interface Sizes {
      [key: string]: THREE.Vector3;
    }

    /**
     * 파츠 정의
     */
    export interface Part {
      url?: string;
      color?: string;
      position?: THREE.Vector3;
      rotation?: THREE.Euler;
      scale?: THREE.Vector3;
    }

    /**
     * 파츠 배열
     */
    export type Parts = Part[];
  }

  export namespace Options {
    /**
     * 전역 옵션
     */
    export interface Global {
      debug: boolean;
      mode?: 'normal' | 'vehicle' | 'airplane';
      controllerType: 'none';
      cameraCollisionType: 'transparent' | 'closeUp';
      camera: {
        type: 'perspective' | 'orthographic';
        control: Controller.CameraControlMode | 'chase' | 'normal';
      };
      minimap: boolean;
      minimapRatio: number;
    }

    /**
     * 부분 옵션 (업데이트용)
     */
    export type Partial = globalThis.Partial<Global>;
  }
}

export type Vector3Like = GaesupCore.Vector3Like;
export type EulerLike = GaesupCore.EulerLike;
export type QuaternionLike = GaesupCore.QuaternionLike;
export type SizeType = GaesupCore.SizeType;
export type DispatchAction<T> = GaesupCore.DispatchAction<T>;
export type DispatchType<T> = GaesupCore.DispatchType<T>;
export type ActiveStateType = GaesupCore.State.Active;
export type PassiveStateType = GaesupCore.State.Passive;
export type GameStatesType = GaesupCore.State.Game;
export type BlockState = GaesupCore.State.Block;
export type KeyboardInputState = GaesupCore.Input.Keyboard;
export type MouseInputState = GaesupCore.Input.Mouse;
export type GamepadInputState = GaesupCore.Input.Gamepad;
export type ClickerOptionState = GaesupCore.Input.ClickerOption;
export type inputState = GaesupCore.Input.Unified;
export type ControlState = GaesupCore.Input.Control;
export type KeyboardControlState<T extends string = string> = GaesupCore.Input.KeyboardControl<T>;
export type ControllerOptionsType = GaesupCore.Config.Controller;
export type ControllerType = GaesupCore.Controller.Type;
export type CameraControlMode = GaesupCore.Controller.CameraControlMode;
export type ControlMode = GaesupCore.Controller.ControlMode;
export type ControllerMode = GaesupCore.Controller.Mode;
export type ModeType = GaesupCore.Controller.ModeType;
export type RefsType = GaesupCore.Refs.Main;
export type ControllerOtherPropType = GaesupCore.Refs.ControllerOtherProp;
export type ResourceUrlsType = GaesupCore.Resource.Urls;
export type SizesType = GaesupCore.Resource.Sizes;
export type PartType = GaesupCore.Resource.Part;
export type PartsType = GaesupCore.Resource.Parts;
export type OptionsType = GaesupCore.Options.Global;
export type PartialOptionsType = GaesupCore.Options.Partial;

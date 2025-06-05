import * as THREE from 'three';
import { Dispatch, ReactNode, RefObject } from 'react';
import { RapierRigidBody, RigidBodyProps } from '@react-three/rapier';
import { Collider } from '@dimforge/rapier3d-compat';
import { GroupProps } from '@react-three/fiber';

// ============================================================================
// 기본 타입들
// ============================================================================

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

  /**
   * 디스패치 타입
   */
  export type DispatchType<T> = Dispatch<DispatchAction<T>>;

  // ============================================================================
  // 상태 관련
  // ============================================================================
  export namespace State {
    /**
     * 활성 상태 (물리 엔진과 직접 연동)
     */
    export interface Active {
      position: THREE.Vector3;
      velocity: THREE.Vector3;
      quat: THREE.Quaternion;
      euler: THREE.Euler;
      direction: THREE.Vector3;
      dir: THREE.Vector3;
    }

    /**
     * 수동 상태 (읽기 전용)
     */
    export interface Passive {
      position: THREE.Vector3;
      quat: THREE.Quaternion;
      euler: THREE.Euler;
      rotation: THREE.Euler;
    }

    /**
     * 게임 상태
     */
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

    /**
     * 주변 탈 것 정보
     */
    export interface NearbyRideable {
      objectkey: string;
      objectType: 'vehicle' | 'airplane';
      name: string;
    }

    /**
     * 블록 상태
     */
    export interface Block {
      camera: boolean;
      control: boolean;
      animation: boolean;
      scroll: boolean;
    }
  }

  // ============================================================================
  // 입력 관련
  // ============================================================================
  export namespace Input {
    /**
     * 키보드 입력 상태
     */
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

  // ============================================================================
  // 설정 관련
  // ============================================================================
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

  // ============================================================================
  // 컨트롤러 타입들
  // ============================================================================
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
      | 'thirdPersonOrbit'
      | 'topDown'
      | 'sideScroll'
      | 'isometric'
      | 'free';

    /**
     * 제어 모드
     */
    export type ControlMode = 'normal' | 'orbit';

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

  // ============================================================================
  // 참조 및 Props 타입들
  // ============================================================================
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

  // ============================================================================
  // 리소스 관련 타입들
  // ============================================================================
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

  // ============================================================================
  // 옵션 관련 타입들
  // ============================================================================
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
        control: Controller.CameraControlMode | 'orbit' | 'normal';
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

// ============================================================================
// 하위 호환성을 위한 타입 별칭들
// ============================================================================

export type Vector3Like = GaesupCore.Vector3Like;
export type EulerLike = GaesupCore.EulerLike;
export type QuaternionLike = GaesupCore.QuaternionLike;
export type SizeType = GaesupCore.SizeType;
export type DispatchAction<T> = GaesupCore.DispatchAction<T>;
export type DispatchType<T> = GaesupCore.DispatchType<T>;

// 상태 관련
export type ActiveStateType = GaesupCore.State.Active;
export type PassiveStateType = GaesupCore.State.Passive;
export type GameStatesType = GaesupCore.State.Game;
export type BlockState = GaesupCore.State.Block;

// 입력 관련
export type KeyboardInputState = GaesupCore.Input.Keyboard;
export type MouseInputState = GaesupCore.Input.Mouse;
export type GamepadInputState = GaesupCore.Input.Gamepad;
export type ClickerOptionState = GaesupCore.Input.ClickerOption;
export type UnifiedInputState = GaesupCore.Input.Unified;
export type ControlState = GaesupCore.Input.Control;
export type KeyboardControlState<T extends string = string> = GaesupCore.Input.KeyboardControl<T>;

// 설정 관련
export type ControllerOptionsType = GaesupCore.Config.Controller;

// 컨트롤러 관련
export type ControllerType = GaesupCore.Controller.Type;
export type CameraControlMode = GaesupCore.Controller.CameraControlMode;
export type ControlMode = GaesupCore.Controller.ControlMode;
export type ControllerMode = GaesupCore.Controller.Mode;
export type ModeType = GaesupCore.Controller.ModeType;

// 참조 관련
export type RefsType = GaesupCore.Refs.Main;
export type ControllerOtherPropType = GaesupCore.Refs.ControllerOtherProp;

// 리소스 관련
export type ResourceUrlsType = GaesupCore.Resource.Urls;
export type SizesType = GaesupCore.Resource.Sizes;
export type PartType = GaesupCore.Resource.Part;
export type PartsType = GaesupCore.Resource.Parts;

// 옵션 관련
export type OptionsType = GaesupCore.Options.Global;
export type PartialOptionsType = GaesupCore.Options.Partial; 
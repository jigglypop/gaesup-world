// ============================================================================
// 컴포넌트 내보내기
// ============================================================================
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
export { Elr, Qt, V3, V30, V31 } from "./gaesup/utils/vector";
export { GaesupWorld } from "./gaesup/world";
export * from "./gaesup/atoms";

// ============================================================================
// 훅 내보내기
// ============================================================================
export { useCharacterPool } from "./gaesup/hooks/useCharacterPool";
export { useClicker } from "./gaesup/hooks/useClicker";
export { useGaesupAnimation } from "./gaesup/hooks/useGaesupAnimation";
export { useGaesupController } from "./gaesup/hooks/useGaesupController";
export { useMovePoint } from "./gaesup/hooks/useMovePoint";
export { usePushKey } from "./gaesup/hooks/usePushKey";
export { useRideable } from "./gaesup/hooks/useRideable";
export { useTeleport } from "./gaesup/hooks/useTeleport";
export { useUnifiedFrame, useMainFrameLoop } from "./gaesup/hooks/useUnifiedFrame";
export { useZoom } from "./gaesup/hooks/useZoom";
export { useKeyboard } from "./gaesup/hooks/useKeyboard";

// ============================================================================
// 타입 내보내기
// ============================================================================
export type {
  // 기본 유틸리티 타입들
  DispatchAction,
  DispatchType,
  Vector3Like,
  EulerLike,
  QuaternionLike,
  
  // 컨트롤 관련 타입들
  ControlState,
  KeyboardControlState,
  PushState,
  
  // 모드 및 상태 타입들
  ControllerType,
  ControlMode,
  ControllerMode,
  ModeType,
  ActiveStateType,
  GameStatesType,
  
  // URL 및 리소스 타입들
  ResourceUrlsType,
  
  // 카메라 관련 타입들
  CameraOptionDebugType,
  CameraOptionType,
  CameraRayType,
  
  // 레이 캐스팅 타입들
  RayType,
  SlopeRayType,
  GroundRayType,
  
  // 애니메이션 타입들
  AnimationTagType,
  ActionsType,
  AnimationAtomType,
  AnimationStatePropType,
  AnimationStateType,
  
  // 클리커 관련 타입들
  ClickerType,
  QueueActionType,
  QueueFunctionType,
  QueueItemType,
  QueueType,
  ClickerOptionType,
  
  // 블록 및 크기 타입들
  BlockType,
  SizeType,
  SizesType,
  
  // 휠 관련 타입들
  WheelStateType,
  WheelsStateType,
  
  // 패시브 상태 타입
  PassiveStateType,
  
  // 포털 타입들
  PortalType,
  PortalsType,
  
  // 참조 타입들
  RefsType,
  
  // 컨트롤러 옵션 타입들
  ControllerOptionsType,
  OptionsType,
  PartialOptionsType,
  
  // 점프 관련 타입들
  JumpInnerType,
  JumpConstType,
  JumpPropType,
  
  // 파츠 타입들
  PartType,
  PartsType,
  
  // 기타 컨트롤러 프로퍼티 타입들
  ControllerOtherPropType,
  
  // 하위 호환성을 위한 별칭들 (deprecated - 새 코드에서는 PascalCase 사용)
  dispatchType,
  controlType,
  keyControlType,
  modeType,
  activeStateType,
  statesType,
  urlsType,
  cameraOptionType,
  gaesupCameraOptionDebugType,
  cameraRayType,
  rayType,
  slopeRayType,
  groundRayType,
  animationTagType,
  actionsType,
  animationAtomType,
  animationStatePropType,
  animationStateType,
  clickerType,
  queueActionType,
  queueFunctionType,
  queueItemType,
  queueType,
  clickerOptionType,
  blockType,
  sizeType,
  sizesType,
  wheelStateType,
  wheelsStateType,
  passiveStateType,
  portalType,
  portalsType,
  refsType,
  controllerOptionsType,
  optionsType,
  partialOptionsType,
  jumpInnerType,
  jumpConstType,
  jumpPropType,
  partType,
  partsType,
  controllerOtherPropType
} from "./gaesup/types";

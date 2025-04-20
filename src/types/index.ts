// 기본 타입
export * from './base';

// 레이 관련 타입
export * from './ray';

// 애니메이션 관련 타입
export * from './animation';

// 컨트롤러/모드 관련 타입
export * from './controller';

// 월드 관련 타입
export * from './world';

// 컴포넌트 관련 타입
export * from './component';

// 콜백 관련 타입
export * from './callback';

// 하위 호환성을 위한 타입 별칭들
export type dispatchType<T> = import('./base').DispatchType<T>;
export type componentTypeString = import('./base').ComponentTypeString;
export type GLTFResult = import('./base').GLTFResultType;
export type refsType = import('./base').RefsType;
export type rayType = import('./ray').RayType;
export type groundRayType = import('./ray').GroundRayType;
export type cameraRayType = import('./ray').CameraRayType;
export type Api<T extends import('three').AnimationClip> =
  import('./animation').AnimationApiType<T>;
export type animationTagType = import('./animation').AnimationTagType;
export type actionsType = import('./animation').ActionsType;
export type animationAtomType = import('./animation').AnimationAtomType;
export type animationStatePropType = import('./animation').AnimationStatePropType;
export type animationStateType = import('./animation').AnimationStateType;
export type controllerOptionsType = import('./controller').ControllerOptionsType;
export type keyControlType = import('./base').KeyControlType;
export type modeType = import('./controller').ModeType;

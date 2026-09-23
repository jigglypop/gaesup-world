import type {
  SceneDocumentCommand,
  SceneDocumentCommandResult,
  SceneJsonObject,
  SceneObjectId,
  SceneVector3,
} from '../scene-object/types';

export type ScriptPropKind =
  | 'number'
  | 'boolean'
  | 'string'
  | 'enum'
  | 'vector3'
  | 'color'
  | 'assetRef'
  | 'objectRef';

export type ScriptNumberProp = { kind: 'number'; default: number; min?: number; max?: number };
export type ScriptBooleanProp = { kind: 'boolean'; default: boolean };
export type ScriptStringProp = { kind: 'string'; default: string };
export type ScriptEnumProp<TValue extends string = string> = {
  kind: 'enum';
  values: readonly TValue[];
  default: TValue;
};
export type ScriptVector3Prop = { kind: 'vector3'; default: SceneVector3 };
export type ScriptColorProp = { kind: 'color'; default: string };
export type ScriptAssetRefProp = { kind: 'assetRef'; assetKind?: string; default: string | null };
export type ScriptObjectRefProp = { kind: 'objectRef'; default: SceneObjectId | null };

export type ScriptPropDefinition =
  | ScriptNumberProp
  | ScriptBooleanProp
  | ScriptStringProp
  | ScriptEnumProp
  | ScriptVector3Prop
  | ScriptColorProp
  | ScriptAssetRefProp
  | ScriptObjectRefProp;

export type ScriptPropSchema = Record<string, ScriptPropDefinition>;

export type ScriptPropValue<TProp extends ScriptPropDefinition> = TProp extends ScriptEnumProp<infer TValue>
  ? TValue
  : TProp['default'];

export type ScriptProps<TSchema extends ScriptPropSchema> = {
  readonly [Key in keyof TSchema]: ScriptPropValue<TSchema[Key]>;
};

export type ScriptVectorHandle = { x: number; y: number; z: number };

export type ScriptObjectHandle = {
  readonly id: SceneObjectId;
  readonly name: string;
  readonly tags: readonly string[];
  readonly position: ScriptVectorHandle;
  readonly rotation: ScriptVectorHandle;
  readonly scale: ScriptVectorHandle;
  hasComponent: (type: string) => boolean;
  getComponentData: (type: string) => SceneJsonObject | undefined;
};

export type ScriptFindQuery = {
  id?: SceneObjectId;
  name?: string;
  tag?: string;
  componentType?: string;
};

export type ScriptEventPayload = Record<string, unknown>;
export type ScriptEventListener = (payload: ScriptEventPayload) => void;

export type ScriptServiceLocator = {
  get: <TService>(key: string) => TService | undefined;
};

export type ScriptTime = {
  readonly delta: number;
  readonly elapsed: number;
  readonly frame: number;
};

export type ScriptContext = {
  readonly objectId: SceneObjectId;
  readonly object: ScriptObjectHandle;
  readonly time: ScriptTime;
  find: (query: ScriptFindQuery) => ScriptObjectHandle[];
  findOne: (query: ScriptFindQuery) => ScriptObjectHandle | undefined;
  emit: (name: string, payload?: ScriptEventPayload) => void;
  on: (name: string, listener: ScriptEventListener) => () => void;
  services: ScriptServiceLocator;
  commit: (command: SceneDocumentCommand) => SceneDocumentCommandResult;
};

export type ScriptInteractionPayload = {
  actorId?: string;
  kind?: string;
};

export type ScriptHooks = {
  onAwake?: () => void;
  onStart?: () => void;
  onEnable?: () => void;
  onDisable?: () => void;
  onUpdate?: (delta: number) => void;
  onFixedUpdate?: (delta: number) => void;
  onLateUpdate?: (delta: number) => void;
  onDestroy?: () => void;
  onInteract?: (payload: ScriptInteractionPayload) => void;
  onTriggerEnter?: (otherId: SceneObjectId) => void;
  onTriggerExit?: (otherId: SceneObjectId) => void;
  onCollisionEnter?: (otherId: SceneObjectId) => void;
  onCollisionExit?: (otherId: SceneObjectId) => void;
};

export type ScriptDefinition<TSchema extends ScriptPropSchema = ScriptPropSchema> = {
  id: string;
  name?: string;
  props: TSchema;
  create: (context: ScriptContext, props: ScriptProps<TSchema>) => ScriptHooks;
};

export type ScriptPropIssue = {
  prop: string;
  message: string;
};

export type ScriptRuntimeError = {
  objectId: SceneObjectId;
  componentId: string;
  scriptId: string;
  hook: string;
  message: string;
};

export type ScriptPhysicsEventKind = 'triggerEnter' | 'triggerExit' | 'collisionEnter' | 'collisionExit';

export type SceneObjectId = string;
export type SceneComponentId = string;
export type SceneComponentType = string;
export type SceneLayerId = string;
export type SceneTag = string;

export type SceneVector3 = readonly [number, number, number];
export type SceneEuler = readonly [number, number, number];

export type SceneJsonPrimitive = string | number | boolean | null;
export type SceneJsonValue =
  | SceneJsonPrimitive
  | readonly SceneJsonValue[]
  | { readonly [key: string]: SceneJsonValue };
export type SceneJsonObject = { readonly [key: string]: SceneJsonValue };

export interface SceneTransform {
  position: SceneVector3;
  rotation: SceneEuler;
  scale: SceneVector3;
}

export interface SceneComponent<
  TType extends SceneComponentType = SceneComponentType,
  TData extends SceneJsonObject = SceneJsonObject,
> {
  id: SceneComponentId;
  type: TType;
  enabled: boolean;
  data: TData;
}

export interface SceneObject {
  id: SceneObjectId;
  name: string;
  parentId?: SceneObjectId;
  transform: SceneTransform;
  components: SceneComponent[];
  tags: SceneTag[];
  layer?: SceneLayerId;
}

export interface SceneDocument {
  version: 1;
  id: string;
  name?: string;
  objects: SceneObject[];
}

export interface CreateSceneComponentInput<
  TType extends SceneComponentType = SceneComponentType,
  TData extends SceneJsonObject = SceneJsonObject,
> {
  id?: SceneComponentId;
  type: TType;
  enabled?: boolean;
  data?: TData;
}

export interface CreateSceneObjectInput {
  id?: SceneObjectId;
  name?: string;
  parentId?: SceneObjectId;
  transform?: Partial<SceneTransform>;
  components?: Array<SceneComponent | CreateSceneComponentInput>;
  tags?: SceneTag[];
  layer?: SceneLayerId;
}

export type SceneValidationIssueCode =
  | 'duplicate-object-id'
  | 'duplicate-component-id'
  | 'scene-migration-failed'
  | 'missing-parent'
  | 'self-parent'
  | 'parent-cycle'
  | 'invalid-transform'
  | 'unsupported-scene-version';

export interface SceneValidationIssue {
  code: SceneValidationIssueCode;
  objectId?: SceneObjectId;
  componentId?: SceneComponentId;
  message: string;
}

export interface SceneValidationResult {
  valid: boolean;
  issues: SceneValidationIssue[];
}

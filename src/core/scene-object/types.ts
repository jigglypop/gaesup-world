export type SceneObjectId = string;
export type SceneComponentId = string;
export type SceneComponentType = string;
export type SceneLayerId = string;
export type SceneTag = string;

export type SceneVector3 = readonly [number, number, number];
export type SceneEuler = readonly [number, number, number];

export type SceneJsonPrimitive = string | number | boolean | null;
export type SceneJsonValue = SceneJsonPrimitive | readonly SceneJsonValue[] | SceneJsonObject;
export type SceneJsonObject = { readonly [key: string]: SceneJsonValue };
export type SceneJsonAuthoringValue =
  | SceneJsonPrimitive
  | readonly SceneJsonAuthoringValue[]
  | SceneJsonAuthoringObject;
export type SceneJsonAuthoringObject = {
  readonly [key: string]: SceneJsonAuthoringValue | undefined;
};
export type CanonicalSceneJsonValue = SceneJsonValue;
export type CanonicalSceneJsonObject = SceneJsonObject;
export type CanonicalSceneData<TData extends SceneJsonAuthoringObject> = TData &
  CanonicalSceneJsonObject;

export interface SceneTransform {
  position: SceneVector3;
  rotation: SceneEuler;
  scale: SceneVector3;
}

export interface SceneComponent<
  TType extends SceneComponentType = SceneComponentType,
  TData extends SceneJsonAuthoringObject = SceneJsonObject,
> {
  id: SceneComponentId;
  type: TType;
  enabled: boolean;
  data: CanonicalSceneData<TData>;
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
  TData extends SceneJsonAuthoringObject = SceneJsonAuthoringObject,
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
  | 'invalid-scene-command'
  | 'invalid-component-data'
  | 'invalid-document-shape'
  | 'scene-migration-failed'
  | 'missing-object'
  | 'missing-component'
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

export type SceneObjectCommandTransformPatch = {
  readonly position?: SceneVector3;
  readonly rotation?: SceneEuler;
  readonly scale?: SceneVector3;
};

export type SceneObjectCommandPatch = {
  readonly name?: string;
  readonly parentId?: SceneObjectId | null;
  readonly transform?: SceneObjectCommandTransformPatch;
  readonly tags?: readonly SceneTag[];
  readonly layer?: SceneLayerId | null;
};

export type SceneDocumentReplaceCommand = {
  readonly type: 'scene-document.replace';
  readonly document: SceneDocument;
};

export type SceneObjectCreateCommand = {
  readonly type: 'scene-object.create';
  readonly object: SceneObject;
};

export type SceneObjectUpdateCommand = {
  readonly type: 'scene-object.update';
  readonly objectId: SceneObjectId;
  readonly patch: SceneObjectCommandPatch;
};

export type SceneObjectDeleteCommand = {
  readonly type: 'scene-object.delete';
  readonly objectId: SceneObjectId;
};

export type SceneObjectMoveCommand = {
  readonly type: 'scene-object.move';
  readonly objectId: SceneObjectId;
  readonly parentId: SceneObjectId | null;
};

export type SceneObjectComponentAddCommand = {
  readonly type: 'scene-object.component.add';
  readonly objectId: SceneObjectId;
  readonly component: SceneComponent;
};

export type SceneObjectComponentRemoveCommand = {
  readonly type: 'scene-object.component.remove';
  readonly objectId: SceneObjectId;
  readonly componentId: SceneComponentId;
};

export type SceneDocumentCommand =
  | SceneDocumentReplaceCommand
  | SceneObjectCreateCommand
  | SceneObjectUpdateCommand
  | SceneObjectDeleteCommand
  | SceneObjectMoveCommand
  | SceneObjectComponentAddCommand
  | SceneObjectComponentRemoveCommand;

export type SceneDocumentReplacedEvent = {
  readonly type: 'scene-document.replaced';
  readonly documentId: string;
};

export type SceneObjectCreatedEvent = {
  readonly type: 'scene-object.created';
  readonly documentId: string;
  readonly objectId: SceneObjectId;
};

export type SceneObjectUpdatedEvent = {
  readonly type: 'scene-object.updated';
  readonly documentId: string;
  readonly objectId: SceneObjectId;
};

export type SceneObjectDeletedEvent = {
  readonly type: 'scene-object.deleted';
  readonly documentId: string;
  readonly objectIds: readonly SceneObjectId[];
};

export type SceneObjectMovedEvent = {
  readonly type: 'scene-object.moved';
  readonly documentId: string;
  readonly objectId: SceneObjectId;
  readonly parentId: SceneObjectId | null;
};

export type SceneObjectComponentAddedEvent = {
  readonly type: 'scene-object.component.added';
  readonly documentId: string;
  readonly objectId: SceneObjectId;
  readonly componentId: SceneComponentId;
};

export type SceneObjectComponentRemovedEvent = {
  readonly type: 'scene-object.component.removed';
  readonly documentId: string;
  readonly objectId: SceneObjectId;
  readonly componentId: SceneComponentId;
};

export type SceneDocumentEvent =
  | SceneDocumentReplacedEvent
  | SceneObjectCreatedEvent
  | SceneObjectUpdatedEvent
  | SceneObjectDeletedEvent
  | SceneObjectMovedEvent
  | SceneObjectComponentAddedEvent
  | SceneObjectComponentRemovedEvent;

export type SceneDocumentCommandAcceptedResult = {
  readonly accepted: true;
  readonly document: SceneDocument;
  readonly event: SceneDocumentEvent;
};

export type SceneDocumentCommandRejectedResult = {
  readonly accepted: false;
  readonly document: SceneDocument;
  readonly issues: readonly SceneValidationIssue[];
};

export type SceneDocumentCommandResult =
  | SceneDocumentCommandAcceptedResult
  | SceneDocumentCommandRejectedResult;

export type SceneDocumentControllerListener = (
  snapshot: SceneDocument,
  event: SceneDocumentEvent,
) => void;

export type SceneDocumentController = {
  getSnapshot: () => SceneDocument;
  subscribe: (listener: SceneDocumentControllerListener) => () => void;
  dispatch: (command: SceneDocumentCommand) => SceneDocumentCommandResult;
};

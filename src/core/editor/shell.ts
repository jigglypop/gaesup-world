import type { ContentBundle, ContentBundleValidation } from '../content';
import {
  addPrefabInstance,
  findPrefabInstanceLink,
  propagatePrefabToDocument,
  replaceWithPrefabInstance,
  revertPrefabInstance,
  revertPrefabInstanceOverride,
  type InstantiatePrefabOptions,
  type PrefabDocument,
  type PrefabInstanceLink,
  type PrefabOverride,
} from '../prefab';
import {
  applySceneDocumentCommand,
  cloneSceneDocument,
  createSceneComponent,
  createSceneObject,
} from '../scene-object';
import type {
  CreateSceneComponentInput,
  CreateSceneObjectInput,
  SceneComponentId,
  SceneDocument,
  SceneDocumentCommand,
  SceneDocumentCommandResult,
  SceneDocumentController,
  SceneJsonObject,
  SceneObject,
  SceneObjectCommandPatch,
  SceneObjectId,
  SceneTransform,
  SceneVector3,
} from '../scene-object';
import type {
  EditorPanelDefaults,
  EditorShellAction,
  EditorShellPluginPanel,
  EditorSidebarPresetInput,
} from './components/EditorLayout/types';

export type EditorShellCommand = {
  id: string;
  label: string;
  run: () => void | Promise<void>;
  undo?: () => void | Promise<void>;
};

export type EditorCommandStackState = {
  undoCount: number;
  redoCount: number;
  lastCommand?: EditorShellCommand;
};

export type EditorCommandStackListener = (state: EditorCommandStackState) => void;

export type EditorShellValidation = (bundle: ContentBundle) => ContentBundleValidation;

export type EditorShellOptions = {
  panels?: EditorShellPluginPanel[];
  defaultActivePanels?: string[];
  defaultPanelOpen?: boolean;
  defaultModalOpen?: boolean;
  hiddenBuiltInPanels?: string[];
  panelOrder?: string[];
  panelDefaults?: Record<string, EditorPanelDefaults>;
  sidebarPreset?: EditorSidebarPresetInput;
  commands?: EditorShellCommand[];
  validate?: EditorShellValidation;
};

export type EditorShell = {
  panels: EditorShellPluginPanel[];
  defaultActivePanels?: string[];
  defaultPanelOpen?: boolean;
  defaultModalOpen?: boolean;
  hiddenBuiltInPanels?: string[];
  panelOrder?: string[];
  panelDefaults?: Record<string, EditorPanelDefaults>;
  sidebarPreset?: EditorSidebarPresetInput;
  actions: EditorShellAction[];
  validate?: EditorShellValidation;
};

export type EditorCommandStack = {
  execute: (command: EditorShellCommand) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getState: () => EditorCommandStackState;
  subscribe: (listener: EditorCommandStackListener) => () => void;
  clear: () => void;
};

export interface SceneDocumentCommandStore {
  getDocument: () => SceneDocument;
  setDocument: (document: SceneDocument) => void;
}

export type SceneObjectEditorPatch = Partial<Pick<SceneObject, 'name' | 'tags'>> & {
  parentId?: SceneObjectId | undefined;
  layer?: string | undefined;
  transform?: Partial<SceneTransform>;
};

export interface SceneObjectEditorCommandFactory {
  createObject: (input: CreateSceneObjectInput) => EditorShellCommand;
  updateObject: (objectId: SceneObjectId, patch: SceneObjectEditorPatch) => EditorShellCommand;
  deleteObject: (objectId: SceneObjectId) => EditorShellCommand;
  moveObject: (objectId: SceneObjectId, parentId: SceneObjectId | undefined) => EditorShellCommand;
  addComponent: (
    objectId: SceneObjectId,
    component: CreateSceneComponentInput,
  ) => EditorShellCommand;
  updateComponent: (
    objectId: SceneObjectId,
    componentId: SceneComponentId,
    data: SceneJsonObject,
  ) => EditorShellCommand;
  removeComponent: (objectId: SceneObjectId, componentId: SceneComponentId) => EditorShellCommand;
  revertPrefabOverride: (
    rootObjectId: SceneObjectId,
    prefab: PrefabDocument,
    override: PrefabOverride,
  ) => EditorShellCommand;
  revertPrefabInstance: (rootObjectId: SceneObjectId, prefab: PrefabDocument) => EditorShellCommand;
  propagatePrefab: (previous: PrefabDocument, next: PrefabDocument) => EditorShellCommand;
  instantiatePrefab: (prefab: PrefabDocument, options: InstantiatePrefabOptions) => EditorShellCommand;
  convertToPrefabInstance: (
    objectId: SceneObjectId,
    prefab: PrefabDocument,
    idPrefix: string,
  ) => EditorShellCommand;
}

export function createEditorShell(options: EditorShellOptions = {}): EditorShell {
  const shell: EditorShell = {
    panels: options.panels ?? [],
    actions: (options.commands ?? []).map((command) => ({
      id: command.id,
      label: command.label,
      onClick: command.run,
    })),
  };
  if (options.defaultActivePanels) {
    shell.defaultActivePanels = options.defaultActivePanels;
  }
  if (typeof options.defaultPanelOpen === 'boolean') {
    shell.defaultPanelOpen = options.defaultPanelOpen;
  }
  if (typeof options.defaultModalOpen === 'boolean') {
    shell.defaultModalOpen = options.defaultModalOpen;
  }
  if (options.hiddenBuiltInPanels) {
    shell.hiddenBuiltInPanels = options.hiddenBuiltInPanels;
  }
  if (options.panelOrder) {
    shell.panelOrder = options.panelOrder;
  }
  if (options.panelDefaults) {
    shell.panelDefaults = options.panelDefaults;
  }
  if (options.sidebarPreset) {
    shell.sidebarPreset = options.sidebarPreset;
  }
  if (options.validate) {
    shell.validate = options.validate;
  }
  return shell;
}

export function createEditorCommandStack(): EditorCommandStack {
  const undoStack: EditorShellCommand[] = [];
  const redoStack: EditorShellCommand[] = [];
  const listeners = new Set<EditorCommandStackListener>();

  const state = (): EditorCommandStackState => {
    const lastCommand = undoStack.at(-1);
    return {
      undoCount: undoStack.length,
      redoCount: redoStack.length,
      ...(lastCommand ? { lastCommand } : {}),
    };
  };
  const notify = () => {
    const nextState = state();
    listeners.forEach((listener) => listener(nextState));
  };

  return {
    execute: async (command) => {
      await command.run();
      if (command.undo) {
        undoStack.push(command);
        redoStack.length = 0;
      }
      notify();
    },
    undo: async () => {
      const command = undoStack.at(-1);
      if (!command?.undo) return;
      await command.undo();
      undoStack.pop();
      redoStack.push(command);
      notify();
    },
    redo: async () => {
      const command = redoStack.at(-1);
      if (!command) return;
      await command.run();
      redoStack.pop();
      undoStack.push(command);
      notify();
    },
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    getState: state,
    subscribe: (listener) => {
      listeners.add(listener);
      listener(state());
      return () => listeners.delete(listener);
    },
    clear: () => {
      undoStack.length = 0;
      redoStack.length = 0;
      notify();
    },
  };
}

export function createEditorTransaction(
  input: Pick<EditorShellCommand, 'id' | 'label'> & { commands: EditorShellCommand[] },
): EditorShellCommand {
  return {
    id: input.id,
    label: input.label,
    run: async () => {
      for (const command of input.commands) {
        await command.run();
      }
    },
    undo: async () => {
      for (const command of [...input.commands].reverse()) {
        await command.undo?.();
      }
    },
  };
}

export function createSceneObjectEditorCommands(
  store: SceneDocumentCommandStore,
): SceneObjectEditorCommandFactory;
export function createSceneObjectEditorCommands(
  store: Pick<SceneDocumentController, 'getSnapshot' | 'dispatch'>,
): SceneObjectEditorCommandFactory;
export function createSceneObjectEditorCommands(
  store: SceneDocumentCommandStore | Pick<SceneDocumentController, 'getSnapshot' | 'dispatch'>,
): SceneObjectEditorCommandFactory {
  const target = createSceneDocumentCommandTarget(store);
  const snapshotCommand = (
    id: string,
    label: string,
    command: SceneDocumentCommand | ((document: SceneDocument) => SceneDocumentCommand),
  ): EditorShellCommand => {
    let before: SceneDocument | undefined;
    return {
      id,
      label,
      run: () => {
        const document = target.capture();
        before = document;
        dispatchSceneDocumentCommand(target, typeof command === 'function' ? command(document) : command);
      },
      undo: () => {
        if (!before) return;
        dispatchSceneDocumentCommand(target, { type: 'scene-document.replace', document: before });
      },
    };
  };
  const replaceDocument = (
    id: string,
    label: string,
    transform: (document: SceneDocument) => SceneDocument,
  ): EditorShellCommand =>
    snapshotCommand(id, label, (document) => ({ type: 'scene-document.replace', document: transform(document) }));

  return {
    createObject(input) {
      const object = createSceneObject(input);
      return snapshotCommand(`scene-object.create.${object.id}`, `Create ${object.name}`, {
        type: 'scene-object.create',
        object,
      });
    },
    updateObject(objectId, patch) {
      return snapshotCommand(`scene-object.update.${objectId}`, `Update ${objectId}`, {
        type: 'scene-object.update',
        objectId,
        patch: materializeEditorPatch(patch),
      });
    },
    deleteObject(objectId) {
      return snapshotCommand(`scene-object.delete.${objectId}`, `Delete ${objectId}`, {
        type: 'scene-object.delete',
        objectId,
      });
    },
    moveObject(objectId, parentId) {
      return snapshotCommand(`scene-object.update.${objectId}`, `Update ${objectId}`, {
        type: 'scene-object.move',
        objectId,
        parentId: parentId ? parentId : null,
      });
    },
    addComponent(objectId, componentInput) {
      const component = createSceneComponent(componentInput);
      return snapshotCommand(
        `scene-object.component.add.${objectId}.${component.id}`,
        `Add ${component.type}`,
        { type: 'scene-object.component.add', objectId, component },
      );
    },
    updateComponent(objectId, componentId, data) {
      return snapshotCommand(
        `scene-object.component.update.${objectId}.${componentId}`,
        `Update ${componentId}`,
        { type: 'scene-object.component.update', objectId, componentId, data },
      );
    },
    removeComponent(objectId, componentId) {
      return snapshotCommand(
        `scene-object.component.remove.${objectId}.${componentId}`,
        `Remove ${componentId}`,
        { type: 'scene-object.component.remove', objectId, componentId },
      );
    },
    revertPrefabOverride(rootObjectId, prefab, override) {
      return replaceDocument(`prefab.revert.${rootObjectId}`, `Revert ${override.kind}`, (document) =>
        revertPrefabInstanceOverride(document, prefab, requirePrefabLink(document, rootObjectId), override),
      );
    },
    revertPrefabInstance(rootObjectId, prefab) {
      return replaceDocument(`prefab.revert-all.${rootObjectId}`, `Revert ${prefab.name}`, (document) =>
        revertPrefabInstance(document, prefab, requirePrefabLink(document, rootObjectId)),
      );
    },
    propagatePrefab(previous, next) {
      return replaceDocument(`prefab.propagate.${next.id}`, `Apply ${next.name}`, (document) =>
        propagatePrefabToDocument(document, previous, next),
      );
    },
    instantiatePrefab(prefab, options) {
      return replaceDocument(`prefab.instantiate.${prefab.id}`, `Place ${prefab.name}`, (document) =>
        addPrefabInstance(document, prefab, options),
      );
    },
    convertToPrefabInstance(objectId, prefab, idPrefix) {
      return replaceDocument(`prefab.link.${objectId}`, `Link ${prefab.name}`, (document) => {
        if (!document.objects.some((object) => object.id === objectId)) {
          throw new TypeError(`[EditorShell Error]: 객체가 없습니다 ${objectId}`);
        }
        return replaceWithPrefabInstance(document, objectId, prefab, idPrefix);
      });
    },
  };
}

function requirePrefabLink(document: SceneDocument, rootObjectId: SceneObjectId): PrefabInstanceLink {
  const link = findPrefabInstanceLink(document, rootObjectId);
  if (!link) throw new TypeError(`[EditorShell Error]: prefab 인스턴스 루트가 아닙니다 ${rootObjectId}`);
  return link;
}

type SceneDocumentCommandTarget = {
  capture: () => SceneDocument;
  dispatch: (command: SceneDocumentCommand) => SceneDocumentCommandResult;
};

function createSceneDocumentCommandTarget(
  store: SceneDocumentCommandStore | Pick<SceneDocumentController, 'getSnapshot' | 'dispatch'>,
): SceneDocumentCommandTarget {
  if ('getSnapshot' in store) {
    return {
      capture: () => store.getSnapshot(),
      dispatch: (command) => store.dispatch(command),
    };
  }

  return {
    capture: () => cloneSceneDocument(store.getDocument()),
    dispatch: (command) => {
      const result = applySceneDocumentCommand(store.getDocument(), command);
      if (result.accepted) store.setDocument(result.document);
      return result;
    },
  };
}

function dispatchSceneDocumentCommand(
  target: SceneDocumentCommandTarget,
  command: SceneDocumentCommand,
): SceneDocument {
  const result = target.dispatch(command);
  if (!result.accepted) {
    throw new TypeError(
      result.issues.map((issue) => issue.message).join(' ') || 'Scene command was rejected.',
    );
  }
  return result.document;
}

function materializeEditorPatch(patch: SceneObjectEditorPatch): SceneObjectCommandPatch {
  return {
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.tags !== undefined ? { tags: [...patch.tags] } : {}),
    ...(patch.transform !== undefined
      ? {
          transform: {
            ...(patch.transform.position !== undefined
              ? { position: cloneVector3(patch.transform.position) }
              : {}),
            ...(patch.transform.rotation !== undefined
              ? { rotation: cloneVector3(patch.transform.rotation) }
              : {}),
            ...(patch.transform.scale !== undefined
              ? { scale: cloneVector3(patch.transform.scale) }
              : {}),
          },
        }
      : {}),
    ...('parentId' in patch ? { parentId: patch.parentId ? patch.parentId : null } : {}),
    ...('layer' in patch ? { layer: patch.layer ? patch.layer : null } : {}),
  };
}

function cloneVector3(vector: SceneVector3): SceneVector3 {
  return [vector[0], vector[1], vector[2]];
}

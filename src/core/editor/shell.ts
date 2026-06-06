import type { ContentBundle, ContentBundleValidation } from '../content';
import { createSceneComponent, createSceneObject } from '../scene-object';
import type {
  CreateSceneComponentInput,
  CreateSceneObjectInput,
  SceneComponentId,
  SceneDocument,
  SceneObject,
  SceneObjectId,
  SceneTransform,
} from '../scene-object';
import type { EditorPanelDefaults, EditorShellAction, EditorShellPluginPanel } from './components/EditorLayout/types';

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
  addComponent: (objectId: SceneObjectId, component: CreateSceneComponentInput) => EditorShellCommand;
  removeComponent: (objectId: SceneObjectId, componentId: SceneComponentId) => EditorShellCommand;
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
      const command = undoStack.pop();
      if (!command?.undo) return;
      await command.undo();
      redoStack.push(command);
      notify();
    },
    redo: async () => {
      const command = redoStack.pop();
      if (!command) return;
      await command.run();
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
): SceneObjectEditorCommandFactory {
  const replaceDocument = (updater: (document: SceneDocument) => SceneDocument) => {
    store.setDocument(updater(cloneSceneDocumentForCommand(store.getDocument())));
  };
  const restoreDocument = (snapshot: SceneDocument) => {
    store.setDocument(cloneSceneDocumentForCommand(snapshot));
  };

  return {
    createObject(input) {
      const object = createSceneObject(input);
      let before: SceneDocument | undefined;
      return {
        id: `scene-object.create.${object.id}`,
        label: `Create ${object.name}`,
        run: () => {
          before = cloneSceneDocumentForCommand(store.getDocument());
          replaceDocument((document) => ({
            ...document,
            objects: [...document.objects, object],
          }));
        },
        undo: () => {
          if (before) restoreDocument(before);
        },
      };
    },
    updateObject(objectId, patch) {
      return createUpdateObjectCommand(store, replaceDocument, restoreDocument, objectId, patch);
    },
    deleteObject(objectId) {
      let before: SceneDocument | undefined;
      return {
        id: `scene-object.delete.${objectId}`,
        label: `Delete ${objectId}`,
        run: () => {
          before = cloneSceneDocumentForCommand(store.getDocument());
          replaceDocument((document) => ({
            ...document,
            objects: document.objects.filter((object) => object.id !== objectId && object.parentId !== objectId),
          }));
        },
        undo: () => {
          if (before) restoreDocument(before);
        },
      };
    },
    moveObject(objectId, parentId) {
      return createUpdateObjectCommand(store, replaceDocument, restoreDocument, objectId, { parentId });
    },
    addComponent(objectId, componentInput) {
      const component = createSceneComponent(componentInput);
      let before: SceneDocument | undefined;
      return {
        id: `scene-object.component.add.${objectId}.${component.id}`,
        label: `Add ${component.type}`,
        run: () => {
          before = cloneSceneDocumentForCommand(store.getDocument());
          replaceDocument((document) => ({
            ...document,
            objects: document.objects.map((object) => (
              object.id === objectId
                ? { ...object, components: [...object.components, component] }
                : object
            )),
          }));
        },
        undo: () => {
          if (before) restoreDocument(before);
        },
      };
    },
    removeComponent(objectId, componentId) {
      let before: SceneDocument | undefined;
      return {
        id: `scene-object.component.remove.${objectId}.${componentId}`,
        label: `Remove ${componentId}`,
        run: () => {
          before = cloneSceneDocumentForCommand(store.getDocument());
          replaceDocument((document) => ({
            ...document,
            objects: document.objects.map((object) => (
              object.id === objectId
                ? { ...object, components: object.components.filter((component) => component.id !== componentId) }
                : object
            )),
          }));
        },
        undo: () => {
          if (before) restoreDocument(before);
        },
      };
    },
  };
}

function applySceneObjectPatch(object: SceneObject, patch: SceneObjectEditorPatch): SceneObject {
  const next: SceneObject = {
    ...object,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.tags !== undefined ? { tags: [...patch.tags] } : {}),
    ...(patch.transform ? { transform: { ...object.transform, ...patch.transform } } : {}),
  };
  if ('parentId' in patch) {
    if (patch.parentId) next.parentId = patch.parentId;
    else delete next.parentId;
  }
  if ('layer' in patch) {
    if (patch.layer) next.layer = patch.layer;
    else delete next.layer;
  }
  return next;
}

function createUpdateObjectCommand(
  store: SceneDocumentCommandStore,
  replaceDocument: (updater: (document: SceneDocument) => SceneDocument) => void,
  restoreDocument: (snapshot: SceneDocument) => void,
  objectId: SceneObjectId,
  patch: SceneObjectEditorPatch,
): EditorShellCommand {
  let before: SceneDocument | undefined;
  return {
    id: `scene-object.update.${objectId}`,
    label: `Update ${objectId}`,
    run: () => {
      before = cloneSceneDocumentForCommand(store.getDocument());
      replaceDocument((document) => ({
        ...document,
        objects: document.objects.map((object) => (
          object.id === objectId ? applySceneObjectPatch(object, patch) : object
        )),
      }));
    },
    undo: () => {
      if (before) restoreDocument(before);
    },
  };
}

function cloneSceneDocumentForCommand(document: SceneDocument): SceneDocument {
  return JSON.parse(JSON.stringify(document)) as SceneDocument;
}

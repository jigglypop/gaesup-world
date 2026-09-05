import type { ContentBundle, ContentBundleValidation } from '../content';
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
  const restoreDocument = (snapshot: SceneDocument) => {
    dispatchSceneDocumentCommand(target, {
      type: 'scene-document.replace',
      document: snapshot,
    });
  };

  return {
    createObject(input) {
      const object = createSceneObject(input);
      const command: SceneDocumentCommand = { type: 'scene-object.create', object };
      let before: SceneDocument | undefined;
      return {
        id: `scene-object.create.${object.id}`,
        label: `Create ${object.name}`,
        run: () => {
          before = cloneSceneDocument(target.getDocument());
          dispatchSceneDocumentCommand(target, command);
        },
        undo: () => {
          if (before) restoreDocument(before);
        },
      };
    },
    updateObject(objectId, patch) {
      return createUpdateObjectCommand(
        target,
        restoreDocument,
        objectId,
        materializeEditorPatch(patch),
      );
    },
    deleteObject(objectId) {
      const command: SceneDocumentCommand = { type: 'scene-object.delete', objectId };
      let before: SceneDocument | undefined;
      return {
        id: `scene-object.delete.${objectId}`,
        label: `Delete ${objectId}`,
        run: () => {
          before = cloneSceneDocument(target.getDocument());
          dispatchSceneDocumentCommand(target, command);
        },
        undo: () => {
          if (before) restoreDocument(before);
        },
      };
    },
    moveObject(objectId, parentId) {
      const canonicalParentId = parentId ? parentId : null;
      return createUpdateObjectCommand(
        target,
        restoreDocument,
        objectId,
        { parentId: canonicalParentId },
        { type: 'scene-object.move', objectId, parentId: canonicalParentId },
      );
    },
    addComponent(objectId, componentInput) {
      const component = createSceneComponent(componentInput);
      const command: SceneDocumentCommand = {
        type: 'scene-object.component.add',
        objectId,
        component,
      };
      let before: SceneDocument | undefined;
      return {
        id: `scene-object.component.add.${objectId}.${component.id}`,
        label: `Add ${component.type}`,
        run: () => {
          before = cloneSceneDocument(target.getDocument());
          dispatchSceneDocumentCommand(target, command);
        },
        undo: () => {
          if (before) restoreDocument(before);
        },
      };
    },
    removeComponent(objectId, componentId) {
      const command: SceneDocumentCommand = {
        type: 'scene-object.component.remove',
        objectId,
        componentId,
      };
      let before: SceneDocument | undefined;
      return {
        id: `scene-object.component.remove.${objectId}.${componentId}`,
        label: `Remove ${componentId}`,
        run: () => {
          before = cloneSceneDocument(target.getDocument());
          dispatchSceneDocumentCommand(target, command);
        },
        undo: () => {
          if (before) restoreDocument(before);
        },
      };
    },
  };
}

type SceneDocumentCommandTarget = {
  getDocument: () => SceneDocument;
  dispatch: (command: SceneDocumentCommand) => SceneDocumentCommandResult;
};

function createUpdateObjectCommand(
  target: SceneDocumentCommandTarget,
  restoreDocument: (snapshot: SceneDocument) => void,
  objectId: SceneObjectId,
  patch: SceneObjectCommandPatch,
  command: SceneDocumentCommand = { type: 'scene-object.update', objectId, patch },
): EditorShellCommand {
  let before: SceneDocument | undefined;
  return {
    id: `scene-object.update.${objectId}`,
    label: `Update ${objectId}`,
    run: () => {
      before = cloneSceneDocument(target.getDocument());
      dispatchSceneDocumentCommand(target, command);
    },
    undo: () => {
      if (before) restoreDocument(before);
    },
  };
}

function createSceneDocumentCommandTarget(
  store: SceneDocumentCommandStore | Pick<SceneDocumentController, 'getSnapshot' | 'dispatch'>,
): SceneDocumentCommandTarget {
  if ('getSnapshot' in store) {
    return {
      getDocument: () => store.getSnapshot(),
      dispatch: (command) => store.dispatch(command),
    };
  }

  return {
    getDocument: () => store.getDocument(),
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

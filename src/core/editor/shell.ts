import type { ContentBundle, ContentBundleValidation } from '../content';
import type { EditorPanelDefaults, EditorShellAction, EditorShellPluginPanel } from './components/EditorLayout/types';

export type EditorShellCommand = {
  id: string;
  label: string;
  run: () => void | Promise<void>;
  undo?: () => void | Promise<void>;
};

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
  clear: () => void;
};

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

  return {
    execute: async (command) => {
      await command.run();
      if (command.undo) {
        undoStack.push(command);
        redoStack.length = 0;
      }
    },
    undo: async () => {
      const command = undoStack.pop();
      if (!command?.undo) return;
      await command.undo();
      redoStack.push(command);
    },
    redo: async () => {
      const command = redoStack.pop();
      if (!command) return;
      await command.run();
      undoStack.push(command);
    },
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    clear: () => {
      undoStack.length = 0;
      redoStack.length = 0;
    },
  };
}

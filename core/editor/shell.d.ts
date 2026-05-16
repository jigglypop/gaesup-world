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
export declare function createEditorShell(options?: EditorShellOptions): EditorShell;
export declare function createEditorCommandStack(): EditorCommandStack;

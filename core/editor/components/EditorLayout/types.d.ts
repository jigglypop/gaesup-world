import type { CSSProperties, ReactNode } from 'react';
import type { RegistryEntry } from '../../../plugins';
import type { EditorShellValidation } from '../../shell';
export interface EditorLayoutProps {
    children?: ReactNode;
    panels?: EditorShellPluginPanel[];
    defaultActivePanels?: string[];
    defaultPanelOpen?: boolean;
    defaultModalOpen?: boolean;
    actions?: EditorShellAction[];
    hiddenBuiltInPanels?: string[];
    panelOrder?: string[];
    panelDefaults?: Record<string, EditorPanelDefaults>;
    validateBundle?: EditorShellValidation;
}
export interface PanelConfig {
    id: string;
    title: string;
    component: ReactNode;
    defaultSide?: 'left' | 'right' | 'floating';
    icon?: string;
    initialWidth?: number;
    initialHeight?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    resizeHandles?: ('right' | 'bottom' | 'corner')[];
    className?: string;
    style?: CSSProperties;
}
export type EditorPanelDefaults = Partial<Omit<PanelConfig, 'id' | 'component'>>;
export interface EditorShellPluginPanel extends PanelConfig {
    pluginId?: string;
}
export interface EditorShellAction {
    id: string;
    label: string;
    disabled?: boolean;
    onClick: () => void | Promise<void>;
}
export declare const EDITOR_PANEL_COMPONENT_KIND: "editor.panel";
export interface EditorPanelComponentExtension {
    kind: typeof EDITOR_PANEL_COMPONENT_KIND;
    panel: EditorShellPluginPanel;
}
export declare function isEditorPanelComponentExtension(value: unknown): value is EditorPanelComponentExtension;
export declare function resolveEditorPanelComponentExtensions(entries: Array<RegistryEntry<unknown>>): EditorShellPluginPanel[];

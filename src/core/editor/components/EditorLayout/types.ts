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

export const EDITOR_PANEL_COMPONENT_KIND = 'editor.panel' as const;

export interface EditorPanelComponentExtension {
    kind: typeof EDITOR_PANEL_COMPONENT_KIND;
    panel: EditorShellPluginPanel;
}

export function isEditorPanelComponentExtension(value: unknown): value is EditorPanelComponentExtension {
    if (!value || typeof value !== 'object') return false;

    const candidate = value as {
        kind?: unknown;
        panel?: unknown;
    };
    if (candidate.kind !== EDITOR_PANEL_COMPONENT_KIND) return false;
    if (!candidate.panel || typeof candidate.panel !== 'object') return false;

    const panel = candidate.panel as Partial<PanelConfig>;
    return (
        typeof panel.id === 'string' &&
        typeof panel.title === 'string' &&
        'component' in panel
    );
}

export function resolveEditorPanelComponentExtensions(
    entries: Array<RegistryEntry<unknown>>,
): EditorShellPluginPanel[] {
    return entries.flatMap((entry) => {
        if (!isEditorPanelComponentExtension(entry.value)) return [];

        const panel = entry.value.panel;
        const pluginId = panel.pluginId ?? entry.pluginId;
        return pluginId === undefined ? [panel] : [{ ...panel, pluginId }];
    });
}

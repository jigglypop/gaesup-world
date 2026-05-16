import { FC } from 'react';
import type { EditorLayoutProps } from './types';
import '../../styles/theme.css';
export { EDITOR_PANEL_COMPONENT_KIND, isEditorPanelComponentExtension, resolveEditorPanelComponentExtensions, } from './types';
export type { EditorLayoutProps, EditorPanelComponentExtension, EditorPanelDefaults, EditorShellAction, EditorShellPluginPanel, PanelConfig, } from './types';
export declare const EditorLayout: FC<EditorLayoutProps>;

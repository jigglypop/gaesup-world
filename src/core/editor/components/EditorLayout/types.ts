import { ReactNode } from "react";

export interface EditorLayoutProps {
    children?: ReactNode;
    panels?: EditorShellPluginPanel[];
    defaultActivePanels?: string[];
    actions?: EditorShellAction[];
}

export interface PanelConfig {
    id: string;
    title: string;
    component: ReactNode;
    defaultSide?: 'left' | 'right' | 'floating';
    icon?: string;
}

export interface EditorShellPluginPanel extends PanelConfig {
    pluginId?: string;
}

export interface EditorShellAction {
    id: string;
    label: string;
    disabled?: boolean;
    onClick: () => void | Promise<void>;
}

export interface FloatingPanel {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

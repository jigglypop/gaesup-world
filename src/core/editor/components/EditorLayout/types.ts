import { ReactNode } from "react";

export interface EditorLayoutProps {
    children?: ReactNode;
}

export interface PanelConfig {
    id: string;
    title: string;
    component: ReactNode;
    defaultSide?: 'left' | 'right' | 'floating';
    icon?: string;
}

export interface FloatingPanel {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

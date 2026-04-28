import { ReactNode, CSSProperties } from "react";

import type { EditorShell } from '../../shell';

export interface EditorProps {
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    shell?: EditorShell;
}

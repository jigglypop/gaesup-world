import { ReactNode } from "react";

import type { EditorShellOptions } from '../../src';
 
export type WorldPageProps = {
  showEditor?: boolean;
  showEditorShell?: boolean;
  showHud?: boolean;
  compactHud?: boolean;
  includeEditorAuxPanels?: boolean;
  editorShellOptions?: EditorShellOptions;
  children?: ReactNode;
}; 
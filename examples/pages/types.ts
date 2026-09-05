import { ReactNode } from 'react';

import type { EditorShellOptions } from 'gaesup-world/editor';

export type WorldPageProps = {
  showEditor?: boolean;
  showEditorShell?: boolean;
  showHud?: boolean;
  compactHud?: boolean;
  includeEditorAuxPanels?: boolean;
  showDiagnostics?: boolean;
  onRuntimeReady?: () => void;
  sceneChildren?: ReactNode;
  overlayChildren?: ReactNode;
  editorShellOptions?: EditorShellOptions;
  children?: ReactNode;
};

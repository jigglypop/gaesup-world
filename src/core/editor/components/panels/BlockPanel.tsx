import React from 'react';

import { BuildingPanel } from './BuildingPanel';
import type { EditorPanelBaseProps } from './types';

export function BlockPanel(props: EditorPanelBaseProps = {}) {
  return <BuildingPanel {...props} forcedEditMode="block" />;
}

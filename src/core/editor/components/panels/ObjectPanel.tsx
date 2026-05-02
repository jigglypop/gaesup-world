import React from 'react';

import { BuildingPanel } from './BuildingPanel';
import type { EditorPanelBaseProps } from './types';

export function ObjectPanel(props: EditorPanelBaseProps = {}) {
  return <BuildingPanel {...props} forcedEditMode="object" />;
}

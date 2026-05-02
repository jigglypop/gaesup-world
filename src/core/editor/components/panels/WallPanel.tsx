import React from 'react';

import { BuildingPanel } from './BuildingPanel';
import type { EditorPanelBaseProps } from './types';

export function WallPanel(props: EditorPanelBaseProps = {}) {
  return <BuildingPanel {...props} forcedEditMode="wall" />;
}

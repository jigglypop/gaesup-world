import type React from 'react';

export type BuildingUINPCPanelContext = {
  editMode: 'npc';
};

export type BuildingUINPCPanelRenderer =
  | React.ReactNode
  | ((context: BuildingUINPCPanelContext) => React.ReactNode);

export type BuildingUIProps = {
  onClose?: () => void;
  canEdit?: boolean;
  npcPanel?: BuildingUINPCPanelRenderer | false;
  extensionPanel?: React.ReactNode;
};

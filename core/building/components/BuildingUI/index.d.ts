import React from 'react';
import { createBuildingScopeId } from '../../id';
import './styles.css';
export type BuildingUINPCPanelContext = {
    editMode: 'npc';
};
export type BuildingUINPCPanelRenderer = React.ReactNode | ((context: BuildingUINPCPanelContext) => React.ReactNode);
export type BuildingUIProps = {
    onClose?: () => void;
    canEdit?: boolean;
    npcPanel?: BuildingUINPCPanelRenderer | false;
    extensionPanel?: React.ReactNode;
};
export declare const createCustomMeshId: typeof createBuildingScopeId;
export declare function BuildingUI({ onClose, canEdit, npcPanel, extensionPanel, }: BuildingUIProps): React.JSX.Element | null;

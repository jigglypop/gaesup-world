import React, { FC } from 'react';
import { type BuildingSystemState } from '../../../../building/types';
import type { EditorPanelBaseProps } from '../types';
import { type BuildingPanelAction } from './sections';
import './styles.css';
export { createPlacementAssetScopeId, createScopedColorMeshConfig } from './helpers';
export type BuildingPanelSlot = 'header' | 'beforeInspector' | 'afterWallSettings' | 'afterTileSettings' | 'afterObjectSettings';
export type { BuildingPanelAction } from './sections';
export type BuildingPanelNPCLayout = 'default' | 'split' | 'sidebars';
export type BuildingPanelNPCPanelContext = {
    editMode: 'npc';
    layout: BuildingPanelNPCLayout;
    defaultPanel: React.ReactNode;
};
export type BuildingPanelNPCPanelRenderer = React.ReactNode | ((context: BuildingPanelNPCPanelContext) => React.ReactNode);
export type BuildingPanelProps = EditorPanelBaseProps & {
    slots?: Partial<Record<BuildingPanelSlot, React.ReactNode>>;
    actions?: BuildingPanelAction[];
    disabledSections?: string[];
    forcedEditMode?: BuildingSystemState['editMode'];
    npcLayout?: BuildingPanelNPCLayout;
    npcPanel?: BuildingPanelNPCPanelRenderer | false;
    hideHeader?: boolean;
};
export declare const BuildingPanel: FC<BuildingPanelProps>;

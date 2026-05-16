import React from 'react';
import { type AssetRecord } from '../../../../assets';
import { type ContentBundle, type ContentBundleValidation } from '../../../../content';
import { type GameplayEventBlueprint } from '../../../../gameplay';
import { type AgentBehaviorBlueprint, type NPCBehaviorBlueprint } from '../../../../npc';
import type { EditorPanelBaseProps } from '../types';
import './styles.css';
export type StudioPanelBundleContext = {
    assets: AssetRecord[];
    bundleId: string;
    bundleName: string;
    version: string;
    gameplayEvents: GameplayEventBlueprint[];
    npcBehaviorBlueprints: NPCBehaviorBlueprint[];
    agentBehaviorBlueprints: AgentBehaviorBlueprint[];
};
export type StudioPanelProps = EditorPanelBaseProps & {
    gameplayEvents?: GameplayEventBlueprint[];
    defaultSlot?: string;
    defaultBundleId?: string;
    defaultBundleName?: string;
    defaultVersion?: string;
    buildBundle?: (context: StudioPanelBundleContext) => ContentBundle;
    validateBundle?: (bundle: ContentBundle) => ContentBundleValidation;
    onSaveWorld?: (slot: string) => void | Promise<void>;
    onLoadWorld?: (slot: string) => boolean | void | Promise<boolean | void>;
    onExportBundle?: (bundle: ContentBundle) => void | Promise<void>;
};
export declare function StudioPanel({ gameplayEvents, defaultSlot, defaultBundleId, defaultBundleName, defaultVersion, buildBundle: buildBundleProp, validateBundle, onSaveWorld, onLoadWorld, onExportBundle, className, style, children, }: StudioPanelProps): React.JSX.Element;

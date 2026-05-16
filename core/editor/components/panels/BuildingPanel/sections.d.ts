import React from 'react';
import { type BuildingTreeKind, type BuildingWallKind, type FlagStyle, type TileShapeType, type BuildingWeatherEffect } from '../../../../building/types';
import type { NPCAnimation, NPCBrainBlueprint, NPCBrainConfig, NPCBehaviorConfig, NPCInstance as NPCInstanceData, NPCPerceptionConfig, NPCTemplate } from '../../../../npc/types';
export type BuildingPanelAction = {
    id: string;
    label: string;
    disabled?: boolean;
    onClick: () => void | Promise<void>;
};
export declare function PanelActionsSection({ actions }: {
    actions: BuildingPanelAction[];
}): React.JSX.Element | null;
export type EnvironmentSectionProps = {
    showSnow: boolean;
    setShowSnow: (show: boolean) => void;
    showFog: boolean;
    setShowFog: (show: boolean) => void;
    fogColor: string;
    setFogColor: (color: string) => void;
    weatherEffect: BuildingWeatherEffect;
    setWeatherEffect: (effect: BuildingWeatherEffect) => void;
};
export declare function EnvironmentSection({ showSnow, setShowSnow, showFog, setShowFog, fogColor, setFogColor, weatherEffect, setWeatherEffect, }: EnvironmentSectionProps): React.JSX.Element;
export type ObjectRotationSectionProps = {
    currentObjectRotation: number;
    setObjectRotation: (rotation: number) => void;
};
export declare function ObjectRotationSection({ currentObjectRotation, setObjectRotation, }: ObjectRotationSectionProps): React.JSX.Element;
export type RotationOption = {
    value: number;
    label: string;
};
export type PlacementSectionProps = {
    isTileMode: boolean;
    currentTileMultiplier: number;
    setTileMultiplier: (multiplier: number) => void;
    currentTileHeight: number;
    setTileHeight: (height: number) => void;
    snapToGrid: boolean;
    setSnapToGrid: (snapToGrid: boolean) => void;
    currentTileShape: TileShapeType;
    setTileShape: (shape: TileShapeType) => void;
    currentTileRotation: number;
    setTileRotation: (rotation: number) => void;
    rotations: RotationOption[];
    selectedTileId: string | null;
    hasSelectedTileGroup: boolean;
    onDeleteSelectedTile: () => void;
};
export declare function PlacementSection({ isTileMode, currentTileMultiplier, setTileMultiplier, currentTileHeight, setTileHeight, snapToGrid, setSnapToGrid, currentTileShape, setTileShape, currentTileRotation, setTileRotation, rotations, selectedTileId, hasSelectedTileGroup, onDeleteSelectedTile, }: PlacementSectionProps): React.JSX.Element;
export type BlockEditSectionProps = {
    currentTileMultiplier: number;
    currentTileHeight: number;
    selectedBlockId: string | null;
    onDeleteSelectedBlock: () => void;
};
export declare function BlockEditSection({ currentTileMultiplier, currentTileHeight, selectedBlockId, onDeleteSelectedBlock, }: BlockEditSectionProps): React.JSX.Element;
export type WallModuleSectionProps = {
    currentWallKind: BuildingWallKind;
    currentWallKindLabel: string;
    setWallKind: (kind: BuildingWallKind) => void;
    currentWallRotation: number;
    setWallRotation: (rotation: number) => void;
    rotations: RotationOption[];
    selectedWallId: string | null;
    hasSelectedWallGroup: boolean;
    onFlipSelectedWall: () => void;
    onDeleteSelectedWall: () => void;
};
export declare function WallModuleSection({ currentWallKind, currentWallKindLabel, setWallKind, currentWallRotation, setWallRotation, rotations, selectedWallId, hasSelectedWallGroup, onFlipSelectedWall, onDeleteSelectedWall, }: WallModuleSectionProps): React.JSX.Element;
export type NPCTemplateSectionProps = {
    templates: NPCTemplate[];
    selectedTemplateId: string | null | undefined;
    setSelectedTemplate: (templateId: string) => void;
};
export declare function NPCTemplateSection({ templates, selectedTemplateId, setSelectedTemplate, }: NPCTemplateSectionProps): React.JSX.Element;
type HoverPosition = {
    x: number;
    y: number;
    z: number;
} | null;
export type NPCMovementSectionProps = {
    instance: NPCInstanceData;
    hoverPosition: HoverPosition;
    updateBehavior: (id: string, updates: Partial<NPCBehaviorConfig>) => void;
    setNavigation: (id: string, waypoints: [number, number, number][], speed?: number) => void;
    clearNavigation: (id: string) => void;
};
export declare function NPCMovementSection({ instance, hoverPosition, updateBehavior, setNavigation, clearNavigation, }: NPCMovementSectionProps): React.JSX.Element;
export type NPCAnimationSectionProps = {
    instance: NPCInstanceData;
    animations: NPCAnimation[];
    updateInstance: (id: string, updates: Partial<NPCInstanceData>) => void;
    updateBehavior: (id: string, updates: Partial<NPCBehaviorConfig>) => void;
};
export declare function NPCAnimationSection({ instance, animations, updateInstance, updateBehavior, }: NPCAnimationSectionProps): React.JSX.Element;
export type NPCBrainSectionProps = {
    instance: NPCInstanceData;
    blueprints: NPCBrainBlueprint[];
    selectedBlueprint: NPCBrainBlueprint | undefined;
    updateBrain: (id: string, updates: Partial<NPCBrainConfig>) => void;
    addBrainBlueprint: (blueprint: NPCBrainBlueprint) => void;
    updateBrainBlueprint: (id: string, updates: NPCBrainBlueprint) => void;
    onPreviewStateChange?: (state: NPCBrainPreviewState) => void;
};
export type NPCBrainPreviewState = {
    mode: 'idle' | 'move' | 'patrol' | 'wander' | 'action';
    label: string;
    target?: [number, number, number];
    waypoints?: [number, number, number][];
    radius?: number;
    animationId?: string;
};
export declare function NPCBrainSection({ instance, blueprints, selectedBlueprint, updateBrain, addBrainBlueprint, updateBrainBlueprint, onPreviewStateChange, }: NPCBrainSectionProps): React.JSX.Element;
export type NPCPerceptionSectionProps = {
    instance: NPCInstanceData;
    updateBrain: (id: string, updates: Partial<NPCBrainConfig>) => void;
    updatePerception: (id: string, updates: Partial<NPCPerceptionConfig>) => void;
};
export declare function NPCPerceptionSection({ instance, updateBrain, updatePerception, }: NPCPerceptionSectionProps): React.JSX.Element;
export type TreeSettingsSectionProps = {
    currentTreeKind: BuildingTreeKind;
    setTreeKind: (kind: BuildingTreeKind) => void;
    currentObjectPrimaryColor: string;
    setObjectPrimaryColor: (color: string) => void;
    currentObjectSecondaryColor: string;
    setObjectSecondaryColor: (color: string) => void;
};
export declare function TreeSettingsSection({ currentTreeKind, setTreeKind, currentObjectPrimaryColor, setObjectPrimaryColor, currentObjectSecondaryColor, setObjectSecondaryColor, }: TreeSettingsSectionProps): React.JSX.Element;
export type FireSettingsSectionProps = {
    currentFireIntensity: number;
    setFireIntensity: (intensity: number) => void;
    currentFireWidth: number;
    setFireWidth: (width: number) => void;
    currentFireHeight: number;
    setFireHeight: (height: number) => void;
    currentFireColor: string;
    setFireColor: (color: string) => void;
};
export declare function FireSettingsSection({ currentFireIntensity, setFireIntensity, currentFireWidth, setFireWidth, currentFireHeight, setFireHeight, currentFireColor, setFireColor, }: FireSettingsSectionProps): React.JSX.Element;
export type BillboardSettingsSectionProps = {
    currentBillboardScale: number;
    setBillboardScale: (scale: number) => void;
    currentBillboardOffsetY: number;
    setBillboardOffsetY: (offsetY: number) => void;
    currentBillboardWidth: number;
    setBillboardWidth: (width: number) => void;
    currentBillboardHeight: number;
    setBillboardHeight: (height: number) => void;
    currentBillboardElevation: number;
    setBillboardElevation: (elevation: number) => void;
    currentBillboardIntensity: number;
    setBillboardIntensity: (intensity: number) => void;
    currentBillboardText: string;
    setBillboardText: (text: string) => void;
    currentBillboardImageUrl: string;
    setBillboardImageUrl: (url: string) => void;
    currentBillboardColor: string;
    setBillboardColor: (color: string) => void;
};
export declare function BillboardSettingsSection({ currentBillboardScale, setBillboardScale, currentBillboardOffsetY, setBillboardOffsetY, currentBillboardWidth, setBillboardWidth, currentBillboardHeight, setBillboardHeight, currentBillboardElevation, setBillboardElevation, currentBillboardIntensity, setBillboardIntensity, currentBillboardText, setBillboardText, currentBillboardImageUrl, setBillboardImageUrl, currentBillboardColor, setBillboardColor, }: BillboardSettingsSectionProps): React.JSX.Element;
export type FlagSettingsSectionProps = {
    currentFlagStyle: FlagStyle;
    setFlagStyle: (style: FlagStyle) => void;
    currentFlagWidth: number;
    setFlagWidth: (width: number) => void;
    currentFlagHeight: number;
    setFlagHeight: (height: number) => void;
    currentFlagImageUrl: string;
    setFlagImageUrl: (url: string) => void;
};
export declare function FlagSettingsSection({ currentFlagStyle, setFlagStyle, currentFlagWidth, setFlagWidth, currentFlagHeight, setFlagHeight, currentFlagImageUrl, setFlagImageUrl, }: FlagSettingsSectionProps): React.JSX.Element;
export {};

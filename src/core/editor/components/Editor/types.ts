import { ReactNode, CSSProperties } from "react";

import type { CreateSceneComponentInput, SceneDocument, SceneObject, SceneObjectId } from '../../../scene-object';
import type { EditorPlayMode } from '../../playMode';
import type { EditorSaveStatus } from '../../saveState';
import type { EditorShell } from '../../shell';
import type { EditorShortcutBinding } from '../../shortcuts';
import type { EditorCommandPaletteItem } from '../CommandPalette';
import type { SceneObjectPatch } from '../panels/InspectorPanel';
import type { ProjectAssetItem, ProjectPrefabRecord } from '../panels/ProjectAssetsPanel';

export interface EditorProps {
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    shell?: EditorShell;
    sceneDocument?: SceneDocument;
    selectedObjectId?: SceneObjectId;
    selectedObjectIds?: SceneObjectId[];
    hoveredObjectId?: SceneObjectId;
    onSelectSceneObject?: (object: SceneObject) => void;
    onHoverSceneObject?: (object: SceneObject | undefined) => void;
    onUpdateSceneObject?: (objectId: SceneObjectId, patch: SceneObjectPatch) => void;
    onAddSceneComponent?: (objectId: SceneObjectId, component: CreateSceneComponentInput) => void;
    onRemoveSceneComponent?: (objectId: SceneObjectId, componentId: string) => void;
    projectScenes?: SceneDocument[];
    projectPrefabs?: ProjectPrefabRecord[];
    selectedProjectItemId?: string;
    onSelectProjectItem?: (item: ProjectAssetItem) => void;
    playMode?: EditorPlayMode;
    onEnterPlayMode?: () => void | Promise<void>;
    onExitPlayMode?: () => void | Promise<void>;
    onPausePlayMode?: () => void;
    onResumePlayMode?: () => void;
    shortcuts?: EditorShortcutBinding[];
    shortcutsEnabled?: boolean;
    commandPaletteItems?: EditorCommandPaletteItem[];
    commandPaletteEnabled?: boolean;
    saveStatus?: EditorSaveStatus;
    onSave?: () => void | Promise<void>;
    onAutosave?: () => void | Promise<void>;
    onToggleAutosave?: (enabled: boolean) => void;
}

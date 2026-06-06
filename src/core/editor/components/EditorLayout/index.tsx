import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { resolveEditorPanelComponentExtensions, type EditorLayoutProps, type PanelConfig } from './types';
import '../../styles/theme.css';
import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../../runtime';
import { useEditorAutosave } from '../../hooks/useEditorAutosave';
import { useEditorShortcuts } from '../../hooks/useEditorShortcuts';
import { formatEditorShortcut, type EditorShortcutBinding } from '../../shortcuts';
import { CommandPalette, type EditorCommandPaletteItem } from '../CommandPalette';
import {
  AnimationPanel,
  BlockPanel,
  CameraPanel,
  CharacterAssetPanel,
  GameplayEventPanel,
  HierarchyPanel,
  InspectorPanel,
  MotionPanel,
  NPCPanel,
  ObjectPanel,
  PerformancePanel,
  ProjectAssetsPanel,
  StudioPanel,
  TilePanel,
  VehiclePanel,
  WallPanel,
  WorldPanel,
} from '../panels';
import { SaveStatusIndicator } from '../SaveStatusIndicator';

const PANEL_TITLE_KO: Record<string, string> = {
  hierarchy: '계층',
  inspector: '속성',
  'project-assets': '프로젝트',
  world: '월드',
  wall: '벽',
  tile: '타일',
  block: '블록',
  object: '오브젝트',
  npc: 'NPC',
  character: '캐릭터',
  vehicle: '탈것',
  animation: '애니메이션',
  camera: '카메라',
  motion: '모션',
  performance: '성능',
  'gameplay-events': '게임 이벤트',
  cinematic: '연출',
  studio: '스튜디오',
};

function localizePanel(panel: PanelConfig): PanelConfig {
  const title = PANEL_TITLE_KO[panel.id];
  return title ? { ...panel, title } : panel;
}

export {
  EDITOR_PANEL_COMPONENT_KIND,
  isEditorPanelComponentExtension,
  resolveEditorPanelComponentExtensions,
} from './types';
export type {
  EditorLayoutProps,
  EditorPanelComponentExtension,
  EditorPanelDefaults,
  EditorShellAction,
  EditorShellPluginPanel,
  PanelConfig,
} from './types';

export const EditorLayout: FC<EditorLayoutProps> = ({
  children,
  panels = [],
  defaultActivePanels = ['hierarchy', 'inspector', 'tile', 'camera'],
  defaultPanelOpen = false,
  defaultModalOpen = false,
  actions = [],
  hiddenBuiltInPanels = [],
  panelOrder,
  panelDefaults = {},
  validateBundle,
  sceneDocument,
  selectedObjectId,
  selectedObjectIds,
  hoveredObjectId,
  onSelectSceneObject,
  onHoverSceneObject,
  onUpdateSceneObject,
  onAddSceneComponent,
  onRemoveSceneComponent,
  projectScenes,
  projectPrefabs,
  selectedProjectItemId,
  onSelectProjectItem,
  playMode = 'edit',
  onEnterPlayMode,
  onExitPlayMode,
  onPausePlayMode,
  onResumePlayMode,
  shortcuts = [],
  shortcutsEnabled = true,
  commandPaletteItems = [],
  commandPaletteEnabled = true,
  saveStatus,
  onSave,
  onAutosave,
  onToggleAutosave,
}) => {
  const runtime = useGaesupRuntime();
  const runtimeRevision = useGaesupRuntimeRevision();
  const componentExtensionPanels = useMemo(
    () => {
      if (!runtime) return [];
      return resolveEditorPanelComponentExtensions(runtime.plugins.context.components.list());
    },
    [runtime, runtimeRevision],
  );
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const commandPaletteShortcut = useMemo<EditorShortcutBinding>(() => ({
    id: 'editor.commandPalette',
    label: '명령 팔레트',
    key: 'k',
    ctrl: true,
    meta: true,
    run: () => setCommandPaletteOpen((open) => !open),
  }), []);
  const saveShortcut = useMemo<EditorShortcutBinding | undefined>(() => {
    if (!onSave) return undefined;
    return {
      id: 'editor.save',
      label: '저장',
      key: 's',
      ctrl: true,
      meta: true,
      disabled: saveStatus?.state === 'saving' || saveStatus?.dirty === false,
      run: () => onSave(),
    };
  }, [onSave, saveStatus?.dirty, saveStatus?.state]);
  const activeShortcuts = useMemo(
    () => [
      ...(commandPaletteEnabled ? [commandPaletteShortcut] : []),
      ...(saveShortcut ? [saveShortcut] : []),
      ...shortcuts,
    ],
    [commandPaletteEnabled, commandPaletteShortcut, saveShortcut, shortcuts],
  );
  useEditorShortcuts(
    activeShortcuts,
    { enabled: shortcutsEnabled },
  );
  useEditorAutosave({
    ...(saveStatus ? { status: saveStatus } : {}),
    ...(onAutosave ? { onAutosave } : {}),
  });

  const panelConfigs = useMemo(() => {
    const hierarchyProps = {
      ...(sceneDocument ? { sceneDocument } : {}),
      ...(selectedObjectId ? { selectedObjectId } : {}),
      ...(selectedObjectIds ? { selectedObjectIds } : {}),
      ...(hoveredObjectId ? { hoveredObjectId } : {}),
      ...(onSelectSceneObject ? { onSelectObject: onSelectSceneObject } : {}),
      ...(onHoverSceneObject ? { onHoverObject: onHoverSceneObject } : {}),
    };
    const inspectorProps = {
      ...(sceneDocument ? { sceneDocument } : {}),
      ...(selectedObjectId ? { selectedObjectId } : {}),
      ...(onUpdateSceneObject ? { onUpdateObject: onUpdateSceneObject } : {}),
      ...(onAddSceneComponent ? { onAddComponent: onAddSceneComponent } : {}),
      ...(onRemoveSceneComponent ? { onRemoveComponent: onRemoveSceneComponent } : {}),
    };
    const projectAssetsProps = {
      ...(projectScenes ? { scenes: projectScenes } : {}),
      ...(projectPrefabs ? { prefabs: projectPrefabs } : {}),
      ...(selectedProjectItemId ? { selectedItemId: selectedProjectItemId } : {}),
      ...(onSelectProjectItem ? { onSelectItem: onSelectProjectItem } : {}),
    };
    const builtInPanels: PanelConfig[] = [
      {
        id: 'hierarchy',
        title: 'Hierarchy',
        component: <HierarchyPanel {...hierarchyProps} />,
        defaultSide: 'left',
      },
      {
        id: 'inspector',
        title: 'Inspector',
        component: <InspectorPanel {...inspectorProps} />,
        defaultSide: 'right',
      },
      {
        id: 'project-assets',
        title: 'Project',
        component: <ProjectAssetsPanel {...projectAssetsProps} />,
        defaultSide: 'left',
      },
      { id: 'world', title: 'World', component: <WorldPanel />, defaultSide: 'left' },
      { id: 'wall', title: 'Wall', component: <WallPanel />, defaultSide: 'left' },
      { id: 'tile', title: 'Tile', component: <TilePanel />, defaultSide: 'left' },
      { id: 'block', title: 'Block', component: <BlockPanel />, defaultSide: 'left' },
      { id: 'object', title: 'Object', component: <ObjectPanel />, defaultSide: 'left' },
      { id: 'npc', title: 'NPC', component: <NPCPanel />, defaultSide: 'left' },
      { id: 'character', title: 'Character', component: <CharacterAssetPanel />, defaultSide: 'left' },
      { id: 'vehicle', title: 'Vehicle', component: <VehiclePanel />, defaultSide: 'left' },
      { id: 'animation', title: 'Animation', component: <AnimationPanel />, defaultSide: 'left' },
      { id: 'camera', title: 'Camera', component: <CameraPanel />, defaultSide: 'right' },
      { id: 'motion', title: 'Motion', component: <MotionPanel />, defaultSide: 'right' },
      { id: 'performance', title: 'Performance', component: <PerformancePanel />, defaultSide: 'right' },
      { id: 'gameplay-events', title: 'Gameplay Events', component: <GameplayEventPanel />, defaultSide: 'right' },
      { id: 'studio', title: 'Studio', component: <StudioPanel {...(validateBundle ? { validateBundle } : {})} />, defaultSide: 'right' },
    ];
    const hidden = new Set(hiddenBuiltInPanels);
    const panelMap = new Map<string, PanelConfig>();
    for (const panel of builtInPanels) {
      if (hidden.has(panel.id)) continue;
      const localizedPanel = localizePanel(panel);
      const defaults = panelDefaults[panel.id] ?? {};
      panelMap.set(panel.id, { ...localizedPanel, ...defaults });
    }
    for (const panel of componentExtensionPanels) {
      const localizedPanel = localizePanel(panel);
      const defaults = panelDefaults[panel.id] ?? {};
      panelMap.set(panel.id, { ...panelMap.get(panel.id), ...localizedPanel, ...defaults });
    }
    for (const panel of panels) {
      const localizedPanel = localizePanel(panel);
      const defaults = panelDefaults[panel.id] ?? {};
      panelMap.set(panel.id, { ...panelMap.get(panel.id), ...localizedPanel, ...defaults });
    }
    const orderedIds = panelOrder ?? [];
    const orderedPanels: PanelConfig[] = [];
    for (const id of orderedIds) {
      const panel = panelMap.get(id);
      if (!panel) continue;
      orderedPanels.push(panel);
      panelMap.delete(id);
    }
    return [...orderedPanels, ...panelMap.values()];
  }, [
    componentExtensionPanels,
    hiddenBuiltInPanels,
    hoveredObjectId,
    onAddSceneComponent,
    onHoverSceneObject,
    onRemoveSceneComponent,
    onSelectSceneObject,
    onUpdateSceneObject,
    panelDefaults,
    panelOrder,
    panels,
    projectPrefabs,
    projectScenes,
    sceneDocument,
    selectedObjectId,
    selectedObjectIds,
    selectedProjectItemId,
    onSelectProjectItem,
    validateBundle,
  ]);

  const defaultPanelId = useMemo(
    () => defaultActivePanels.find((panelId) => panelConfigs.some((config) => config.id === panelId)) ?? panelConfigs[0]?.id ?? '',
    [defaultActivePanels, panelConfigs],
  );

  const [activePanelId, setActivePanelId] = useState(defaultPanelId);
  const [isPanelOpen, setIsPanelOpen] = useState(defaultPanelOpen);
  const [isModalOpen, setIsModalOpen] = useState(defaultModalOpen);
  const modalPreferredPanelIds = useMemo(
    () => new Set(['npc', 'gameplay-events', 'studio']),
    [],
  );
  const selectedPanelId = panelConfigs.some((config) => config.id === activePanelId) ? activePanelId : defaultPanelId;
  const selectedPanel = panelConfigs.find((config) => config.id === selectedPanelId);
  const selectPanel = useCallback((panelId: string) => {
    const isSamePanel = panelId === selectedPanelId;
    const shouldOpen = isSamePanel ? !isPanelOpen : true;
    const shouldUseModal = shouldOpen && modalPreferredPanelIds.has(panelId);
    setActivePanelId(panelId);
    setIsPanelOpen(shouldOpen);
    setIsModalOpen(shouldUseModal);
  }, [isPanelOpen, modalPreferredPanelIds, selectedPanelId]);
  const paletteItems = useMemo<EditorCommandPaletteItem[]>(() => {
    const panelItems = panelConfigs.map((panel) => ({
      id: `panel.${panel.id}`,
      label: `${panel.title} 열기`,
      group: '패널',
      detail: panel.id,
      run: () => selectPanel(panel.id),
    }));
    const actionItems = actions.map((action) => ({
      id: `action.${action.id}`,
      label: action.label,
      group: '액션',
      ...(action.disabled !== undefined ? { disabled: action.disabled } : {}),
      run: action.onClick,
    }));
    const shortcutItems = activeShortcuts.map((shortcut) => ({
      id: `shortcut.${shortcut.id}`,
      label: shortcut.label,
      group: '단축키',
      shortcut: formatEditorShortcut(shortcut),
      ...(shortcut.disabled !== undefined ? { disabled: shortcut.disabled } : {}),
      run: () => shortcut.run(new KeyboardEvent('keydown', {
        key: shortcut.key,
        ...(shortcut.code ? { code: shortcut.code } : {}),
      })),
    }));
    return [...panelItems, ...actionItems, ...shortcutItems, ...commandPaletteItems];
  }, [actions, activeShortcuts, commandPaletteItems, panelConfigs, selectPanel]);

  useEffect(() => {
    if (selectedPanelId) {
      setActivePanelId(selectedPanelId);
    }
  }, [selectedPanelId]);

  return (
    <div className="editor-root">
      <aside className={`editor-sidebar ${isPanelOpen ? 'editor-sidebar--open' : 'editor-sidebar--collapsed'}`} aria-label="에디터 사이드바">
        <div className="editor-sidebar-menu">
          <div className="editor-sidebar-header">
            <div className="editor-shell-title">에디터</div>
            <div className="editor-shell-status">{isPanelOpen ? selectedPanel?.title ?? '패널 없음' : ''}</div>
          </div>

          <nav className="editor-panel-menu editor-panel-menu--flat">
            {panelConfigs.map((config) => (
              <button
                key={config.id}
                type="button"
                onClick={() => selectPanel(config.id)}
                className={`editor-panel-toggle ${selectedPanelId === config.id && isPanelOpen ? 'active' : ''}`}
                title={config.title}
              >
                {config.title}
              </button>
            ))}
          </nav>

          <div className="editor-sidebar-footer">
            {saveStatus && (
              <SaveStatusIndicator
                status={saveStatus}
                {...(onSave ? { onSave } : {})}
                {...(onToggleAutosave ? { onToggleAutosave } : {})}
              />
            )}
            <div className="editor-play-mode-controls" aria-label="플레이 모드 조작">
              {playMode === 'edit' ? (
                <button type="button" onClick={() => { void onEnterPlayMode?.(); }}>실행</button>
              ) : (
                <button type="button" onClick={() => { void onExitPlayMode?.(); }}>정지</button>
              )}
              {playMode === 'play' && (
                <button type="button" onClick={onPausePlayMode}>일시정지</button>
              )}
              {playMode === 'paused' && (
                <button type="button" onClick={onResumePlayMode}>재개</button>
              )}
            </div>
            {actions.length > 0 && (
              <div className="editor-menu-section">
                <div className="editor-region-label">액션</div>
                {actions.map(action => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => { void action.onClick(); }}
                    className="editor-panel-toggle"
                    disabled={action.disabled}
                    title={action.label}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
            <div className="editor-shell-hint">좌클릭 배치 · 우클릭 회전 · Q/E 높이 조절</div>
          </div>
        </div>

        {isPanelOpen && !isModalOpen && (
          <section className={`editor-sidebar-panel ${selectedPanel?.className ?? ''}`}>
            <div className="editor-sidebar-panel-header">
              <div>
                <div className="editor-region-label">패널</div>
                <h2>{selectedPanel?.title ?? '패널'}</h2>
              </div>
              <button
                type="button"
                className="editor-sidebar-close"
                onClick={() => setIsModalOpen(true)}
                aria-label="패널 전체 화면 열기"
              >
                전체
              </button>
              <button
                type="button"
                className="editor-sidebar-close"
                onClick={() => setIsPanelOpen(false)}
                aria-label="패널 닫기"
              >
                닫기
              </button>
            </div>
            <div className="editor-sidebar-panel-content" style={selectedPanel?.style}>
              {selectedPanel?.component}
            </div>
          </section>
        )}
      </aside>

      {isPanelOpen && isModalOpen && selectedPanel && (
        <section
          className={`editor-panel-modal ${selectedPanelId === 'npc' ? 'editor-panel-modal--npc' : ''}`}
          aria-label={`${selectedPanel.title} 패널 모달`}
        >
          <div className={`editor-panel-modal__surface ${selectedPanel.className ?? ''}`}>
            <header className="editor-panel-modal__header">
              <div>
                <div className="editor-region-label">패널</div>
                <h2>{selectedPanel.title}</h2>
              </div>
              <div className="editor-panel-modal__actions">
                <button
                  type="button"
                  className="editor-sidebar-close"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="패널을 사이드바로 보내기"
                >
                  사이드바
                </button>
                <button
                  type="button"
                  className="editor-sidebar-close"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsPanelOpen(false);
                  }}
                  aria-label="패널 닫기"
                >
                  닫기
                </button>
              </div>
            </header>
            <div
              className={`editor-panel-modal__content ${selectedPanelId === 'npc' ? 'editor-panel-modal__content--npc' : ''}`}
              style={selectedPanel.style}
            >
              {selectedPanel.component}
            </div>
          </div>
        </section>
      )}

      <CommandPalette
        open={isCommandPaletteOpen}
        items={paletteItems}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {children}
    </div>
  );
};

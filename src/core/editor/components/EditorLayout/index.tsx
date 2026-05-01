import React, { FC, useEffect, useMemo, useState } from 'react';

import '../../styles/theme.css';
import {
  AnimationPanel,
  BuildingPanel,
  CameraPanel,
  CharacterAssetPanel,
  GameplayEventPanel,
  MotionPanel,
  PerformancePanel,
  StudioPanel,
  VehiclePanel
} from '../panels';
import { EditorLayoutProps, PanelConfig } from './types';

export const EditorLayout: FC<EditorLayoutProps> = ({
  children,
  panels = [],
  defaultActivePanels = ['building', 'character', 'camera'],
  actions = [],
  hiddenBuiltInPanels = [],
  panelOrder,
  panelDefaults = {},
  validateBundle,
}) => {
  const panelConfigs = useMemo(() => {
    const builtInPanels: PanelConfig[] = [
      { id: 'building', title: '건축', component: <BuildingPanel />, defaultSide: 'left' },
      { id: 'character', title: '캐릭터', component: <CharacterAssetPanel />, defaultSide: 'left' },
      { id: 'vehicle', title: '탈것', component: <VehiclePanel />, defaultSide: 'left' },
      { id: 'animation', title: '애니메이션', component: <AnimationPanel />, defaultSide: 'left' },
      { id: 'camera', title: '카메라', component: <CameraPanel />, defaultSide: 'right' },
      { id: 'motion', title: '모션', component: <MotionPanel />, defaultSide: 'right' },
      { id: 'performance', title: '성능', component: <PerformancePanel />, defaultSide: 'right' },
      { id: 'gameplay-events', title: '게임플레이 이벤트', component: <GameplayEventPanel />, defaultSide: 'right' },
      { id: 'studio', title: '스튜디오', component: <StudioPanel {...(validateBundle ? { validateBundle } : {})} />, defaultSide: 'right' },
    ];
    const hidden = new Set(hiddenBuiltInPanels);
    const panelMap = new Map<string, PanelConfig>();
    for (const panel of builtInPanels) {
      if (hidden.has(panel.id)) continue;
      const defaults = panelDefaults[panel.id] ?? {};
      panelMap.set(panel.id, { ...panel, ...defaults });
    }
    for (const panel of panels) {
      const defaults = panelDefaults[panel.id] ?? {};
      panelMap.set(panel.id, { ...panelMap.get(panel.id), ...panel, ...defaults });
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
  }, [hiddenBuiltInPanels, panelDefaults, panelOrder, panels, validateBundle]);

  const defaultPanelId = useMemo(
    () => defaultActivePanels.find((panelId) => panelConfigs.some((config) => config.id === panelId)) ?? panelConfigs[0]?.id ?? '',
    [defaultActivePanels, panelConfigs],
  );

  const [activePanelId, setActivePanelId] = useState(defaultPanelId);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const selectedPanelId = panelConfigs.some((config) => config.id === activePanelId) ? activePanelId : defaultPanelId;
  const selectedPanel = panelConfigs.find((config) => config.id === selectedPanelId);

  const toolPanels = panelConfigs.filter((config) => config.defaultSide !== 'right');
  const inspectorPanels = panelConfigs.filter((config) => config.defaultSide === 'right');

  useEffect(() => {
    if (selectedPanelId) {
      setActivePanelId(selectedPanelId);
    }
  }, [selectedPanelId]);

  const selectPanel = (panelId: string) => {
    setActivePanelId(panelId);
    setIsPanelOpen((open) => (panelId === selectedPanelId ? !open : true));
  };

  return (
    <div className="editor-root">
      <aside className={`editor-sidebar ${isPanelOpen ? 'editor-sidebar--open' : 'editor-sidebar--collapsed'}`} aria-label="Editor sidebar">
        <div className="editor-sidebar-menu">
          <div className="editor-sidebar-header">
            <div className="editor-shell-title">Editor</div>
            <div className="editor-shell-status">{isPanelOpen ? selectedPanel?.title ?? '패널 없음' : ''}</div>
          </div>

          <nav className="editor-panel-menu">
            {toolPanels.length > 0 && (
              <div className="editor-menu-section">
                <div className="editor-region-label">도구</div>
                {toolPanels.map((config) => (
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
              </div>
            )}

            {inspectorPanels.length > 0 && (
              <div className="editor-menu-section">
                <div className="editor-region-label">설정</div>
                {inspectorPanels.map((config) => (
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
              </div>
            )}
          </nav>

          <div className="editor-sidebar-footer">
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

        {isPanelOpen && (
          <section className={`editor-sidebar-panel ${selectedPanel?.className ?? ''}`}>
            <div className="editor-sidebar-panel-header">
              <div>
                <div className="editor-region-label">패널</div>
                <h2>{selectedPanel?.title ?? '패널'}</h2>
              </div>
              <button
                type="button"
                className="editor-sidebar-close"
                onClick={() => setIsPanelOpen(false)}
                aria-label="패널 접기"
              >
                접기
              </button>
            </div>
            <div className="editor-sidebar-panel-content" style={selectedPanel?.style}>
              {selectedPanel?.component}
            </div>
          </section>
        )}
      </aside>

      {children}
    </div>
  );
}; 
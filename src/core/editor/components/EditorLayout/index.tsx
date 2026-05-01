import React, { FC, useMemo, useState } from 'react';

import '../../styles/theme.css';
import { 
  AnimationPanel,
  BuildingPanel,
  CameraPanel,
  CharacterAssetPanel,
  MotionPanel,
  PerformancePanel,
  VehiclePanel
} from '../panels';
import { ResizablePanel } from '../ResizablePanel';
import { EditorLayoutProps, FloatingPanel, PanelConfig } from './types';

export const EditorLayout: FC<EditorLayoutProps> = ({
  children,
  panels = [],
  defaultActivePanels = ['building', 'character', 'camera'],
  actions = [],
}) => {
  const [activePanels, setActivePanels] = useState<string[]>(defaultActivePanels);
  const [floatingPanels, setFloatingPanels] = useState<FloatingPanel[]>([]);
  const [minimizedPanels, setMinimizedPanels] = useState<string[]>([]);

  const builtInPanels: PanelConfig[] = [
    { id: 'building', title: '건축', component: <BuildingPanel />, defaultSide: 'left' },
    { id: 'character', title: '캐릭터', component: <CharacterAssetPanel />, defaultSide: 'left' },
    { id: 'vehicle', title: '탑승체', component: <VehiclePanel />, defaultSide: 'left' },
    { id: 'animation', title: '애니메이션', component: <AnimationPanel />, defaultSide: 'left' },
    { id: 'camera', title: '카메라', component: <CameraPanel />, defaultSide: 'right' },
    { id: 'motion', title: '모션', component: <MotionPanel />, defaultSide: 'right' },
    { id: 'performance', title: '성능', component: <PerformancePanel />, defaultSide: 'right' },
  ];
  const panelConfigs = useMemo(() => [...builtInPanels, ...panels], [panels]);

  const togglePanel = (panelId: string) => {
    setActivePanels(prev => {
      if (prev.includes(panelId)) {
        return prev.filter(id => id !== panelId);
      } else {
        return [...prev, panelId];
      }
    });
    setMinimizedPanels(prev => prev.filter(id => id !== panelId));
  };

  const closePanel = (panelId: string) => {
    setActivePanels(prev => prev.filter(id => id !== panelId));
    setFloatingPanels(prev => prev.filter(panel => panel.id !== panelId));
    setMinimizedPanels(prev => prev.filter(id => id !== panelId));
  };

  const minimizePanel = (panelId: string) => {
    setMinimizedPanels(prev => [...prev, panelId]);
    setActivePanels(prev => prev.filter(id => id !== panelId));
    setFloatingPanels(prev => prev.filter(panel => panel.id !== panelId));
  };

  const restorePanel = (panelId: string) => {
    setMinimizedPanels(prev => prev.filter(id => id !== panelId));
    setActivePanels(prev => [...prev, panelId]);
  };

  const handlePanelDrop = (panelId: string, x: number, y: number) => {
    const existingFloating = floatingPanels.find(p => p.id === panelId);
    if (existingFloating) {
      setFloatingPanels(prev => prev.map(p => 
        p.id === panelId ? { ...p, x, y } : p
      ));
    } else {
      setFloatingPanels(prev => [...prev, {
        id: panelId,
        x,
        y,
        width: 300,
        height: 400
      }]);
    }
  };

  const getLeftPanels = () => panelConfigs.filter(config => 
    activePanels.includes(config.id) && 
    config.defaultSide === 'left' && 
    !floatingPanels.some(fp => fp.id === config.id)
  );

  const getRightPanels = () => panelConfigs.filter(config => 
    activePanels.includes(config.id) && 
    config.defaultSide === 'right' && 
    !floatingPanels.some(fp => fp.id === config.id)
  );

  const getFloatingPanels = () => floatingPanels.filter(fp => activePanels.includes(fp.id));
  const leftPanels = getLeftPanels();
  const rightPanels = getRightPanels();
  const floatingPanelItems = getFloatingPanels();

  return (
    <div className="editor-root">
      <div className="editor-shell-header">
        <div className="editor-shell-title">Inspector Editor</div>
        <div className="editor-panel-bar" aria-label="Editor panels">
          {panelConfigs.map(config => (
            <button
              key={config.id}
              onClick={() => togglePanel(config.id)}
              className={`editor-panel-toggle ${activePanels.includes(config.id) ? 'active' : ''}`}
              title={config.title}
            >
              {config.title}
            </button>
          ))}
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => { void action.onClick(); }}
              className="editor-panel-toggle"
              disabled={action.disabled}
              title={action.label}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {leftPanels.length > 0 && (
        <div className="editor-left-stack">
          <div className="editor-region-label">Tools</div>
          {leftPanels.map((config, index) => (
            <ResizablePanel
              key={config.id}
              title={config.title}
              initialWidth={320}
              initialHeight={Math.min(640, Math.max(420, window.innerHeight - 120))}
              minWidth={260}
              maxWidth={500}
              resizeHandles={['right']}
              className="editor-glass-panel"
              style={{
                marginBottom: index < leftPanels.length - 1 ? '8px' : '0'
              }}
              onClose={() => closePanel(config.id)}
              onMinimize={() => minimizePanel(config.id)}
              onDrop={(x, y) => handlePanelDrop(config.id, x, y)}
            >
              {config.component}
            </ResizablePanel>
          ))}
        </div>
      )}

      {rightPanels.length > 0 && (
        <div className="editor-right-stack">
          <div className="editor-region-label">Inspector</div>
          {rightPanels.map((config, index) => (
            <ResizablePanel
              key={config.id}
              title={config.title}
              initialWidth={300}
              initialHeight={Math.min(520, Math.max(360, window.innerHeight - 120))}
              minWidth={260}
              maxWidth={500}
              resizeHandles={['corner']}
              className="editor-glass-panel"
              style={{
                marginBottom: index < rightPanels.length - 1 ? '8px' : '0'
              }}
              onClose={() => closePanel(config.id)}
              onMinimize={() => minimizePanel(config.id)}
              onDrop={(x, y) => handlePanelDrop(config.id, x, y)}
            >
              {config.component}
            </ResizablePanel>
          ))}
        </div>
      )}

      {floatingPanelItems.map(floatingPanel => {
        const config = panelConfigs.find(c => c.id === floatingPanel.id);
        if (!config) return null;
        
        return (
          <ResizablePanel
            key={floatingPanel.id}
            title={config.title}
            initialWidth={floatingPanel.width}
            initialHeight={floatingPanel.height}
            minWidth={200}
            maxWidth={800}
            resizeHandles={['right', 'bottom', 'corner']}
            className="editor-glass-panel"
            style={{
              position: 'fixed',
              left: `${floatingPanel.x}px`,
              top: `${floatingPanel.y}px`,
              zIndex: 1001
            }}
            onClose={() => closePanel(config.id)}
            onMinimize={() => minimizePanel(config.id)}
            onDrop={(x, y) => handlePanelDrop(config.id, x, y)}
          >
            {config.component}
          </ResizablePanel>
        );
      })}

      <div className="editor-shell-footer">
        <div className="editor-shell-status">
          {activePanels.length > 0 ? `Active: ${activePanels.length}` : 'No active panels'}
        </div>
        {minimizedPanels.length > 0 && (
          <div className="editor-minimized-dock">
            {minimizedPanels.map(panelId => {
              const config = panelConfigs.find(c => c.id === panelId);
              if (!config) return null;

              return (
                <button
                  key={panelId}
                  onClick={() => restorePanel(panelId)}
                  className="editor-minimized-item"
                  title={`${config.title} 복원`}
                >
                  {config.title}
                </button>
              );
            })}
          </div>
        )}
        <div className="editor-shell-hint">좌클릭 배치 · 우클릭 회전 · Q/E 높이 조절</div>
      </div>

      {children}
    </div>
  );
}; 
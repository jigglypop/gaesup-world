import React, { FC, useState } from 'react';

import '../../styles/theme.css';
import { 
  AnimationPanel,
  BuildingPanel,
  CameraPanel,
  MotionPanel,
  PerformancePanel,
  VehiclePanel
} from '../panels';
import { ResizablePanel } from '../ResizablePanel';
import { EditorLayoutProps, FloatingPanel, PanelConfig } from './types';

export const EditorLayout: FC<EditorLayoutProps> = ({ children }) => {
  const [activePanels, setActivePanels] = useState<string[]>(['building', 'vehicle', 'performance']);
  const [floatingPanels, setFloatingPanels] = useState<FloatingPanel[]>([]);
  const [minimizedPanels, setMinimizedPanels] = useState<string[]>([]);

  const panelConfigs: PanelConfig[] = [
    { id: 'building', title: 'Building', component: <BuildingPanel />, defaultSide: 'left' },
    { id: 'animation', title: 'Animation', component: <AnimationPanel />, defaultSide: 'left' },
    { id: 'camera', title: 'Camera', component: <CameraPanel />, defaultSide: 'left' },
    { id: 'motion', title: 'Motion', component: <MotionPanel />, defaultSide: 'right' },
    { id: 'performance', title: 'Performance', component: <PerformancePanel />, defaultSide: 'right' },
    { id: 'vehicle', title: 'Vehicle', component: <VehiclePanel />, defaultSide: 'left' },
  ];

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

  return (
    <div className="editor-root">
      {/* Panel Toggle Bar */}
      <div className="editor-panel-bar">
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
      </div>

      {/* Left Panel Stack */}
      {getLeftPanels().length > 0 && (
        <div className="editor-left-stack">
          {getLeftPanels().map((config, index) => (
            <ResizablePanel
              key={config.id}
              title={config.title}
              initialWidth={280}
              initialHeight={Math.max(300, (window.innerHeight - 120) / getLeftPanels().length)}
              minWidth={200}
              maxWidth={500}
              resizeHandles={['right']}
              className="editor-glass-panel"
              style={{
                marginBottom: index < getLeftPanels().length - 1 ? '8px' : '0'
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

      {/* Right Panel Stack */}
      {getRightPanels().length > 0 && (
        <div className="editor-right-stack">
          {getRightPanels().map((config, index) => (
            <ResizablePanel
              key={config.id}
              title={config.title}
              initialWidth={320}
              initialHeight={Math.max(300, (window.innerHeight - 120) / getRightPanels().length)}
              minWidth={200}
              maxWidth={500}
              resizeHandles={['corner']}
              className="editor-glass-panel"
              style={{
                marginBottom: index < getRightPanels().length - 1 ? '8px' : '0'
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

      {/* Floating Panels */}
      {getFloatingPanels().map(floatingPanel => {
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

      {/* Minimized Panels Dock */}
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
                title={`Restore ${config.title}`}
              >
                {config.title}
              </button>
            );
          })}
        </div>
      )}

      {children}
    </div>
  );
}; 
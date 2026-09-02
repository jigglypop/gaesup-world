import React, { useState, type ReactNode } from 'react';

import { SceneFader, useBuildingStore } from 'gaesup-world';

import Info from '../info';
import { Teleport } from '../teleport';

type HudTool = 'info' | 'teleport' | null;

function LeftSidebar({
  activeTool,
  onToggleTool,
  showEnvironmentControls,
  compact,
  children,
}: {
  activeTool: HudTool;
  onToggleTool: (tool: Exclude<HudTool, null>) => void;
  showEnvironmentControls: boolean;
  compact: boolean;
  children?: ReactNode;
}) {
  const showSnow = useBuildingStore((s) => s.showSnow);
  const setShowSnow = useBuildingStore((s) => s.setShowSnow);
  const showFog = useBuildingStore((s) => s.showFog);
  const setShowFog = useBuildingStore((s) => s.setShowFog);
  const [showWorldTools, setShowWorldTools] = useState(!compact);
  const [showQuickTools, setShowQuickTools] = useState(!compact);
  const showInfo = activeTool === 'info';
  const showTele = activeTool === 'teleport';

  return (
    <div className="gp-left">
      <div className="gp-glass gp-panel" style={{ width: '100%' }}>
        <div className="gp-panel-title">빠른 도구</div>
        <button className="gp-btn" onClick={() => setShowQuickTools((open) => !open)}>
          <span>{showQuickTools ? '도구 접기' : '도구 펼치기'}</span>
          <span className="gp-key">{showQuickTools ? 'ON' : 'OFF'}</span>
        </button>
        {showQuickTools && (
          <div className="gp-actionrow">
            <button
              className={`gp-btn${showInfo ? ' gp-btn--active' : ''}`}
              onClick={() => onToggleTool('info')}
            >
              <span>정보 패널</span>
              <span className="gp-key">{showInfo ? 'ON' : 'OFF'}</span>
            </button>
            <button
              className={`gp-btn${showTele ? ' gp-btn--active' : ''}`}
              onClick={() => onToggleTool('teleport')}
            >
              <span>텔레포트</span>
              <span className="gp-key">{showTele ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        )}
      </div>
      {showEnvironmentControls && (
        <div className="gp-glass gp-panel" style={{ width: '100%' }}>
          <div className="gp-panel-title">월드 환경</div>
          <button className="gp-btn" onClick={() => setShowWorldTools((open) => !open)}>
            <span>{showWorldTools ? '환경 접기' : '환경 펼치기'}</span>
            <span className="gp-key">{showWorldTools ? 'ON' : 'OFF'}</span>
          </button>
          {showWorldTools && (
            <div className="gp-actionrow">
              <button
                className={`gp-btn${showSnow ? ' gp-btn--active' : ''}`}
                onClick={() => setShowSnow(!showSnow)}
              >
                <span>월드 눈</span>
                <span className="gp-key">{showSnow ? 'ON' : 'OFF'}</span>
              </button>
              <button
                className={`gp-btn${showFog ? ' gp-btn--active' : ''}`}
                onClick={() => setShowFog(!showFog)}
              >
                <span>장면 안개</span>
                <span className="gp-key">{showFog ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export type HudShellProps = {
  showEnvironmentControls?: boolean;
  compact?: boolean;
  children?: ReactNode;
};

export function HudShell({
  showEnvironmentControls = true,
  compact = false,
  children,
}: HudShellProps) {
  const [activeTool, setActiveTool] = useState<HudTool>(null);
  const handleToggleTool = (tool: Exclude<HudTool, null>) => {
    setActiveTool((current) => (current === tool ? null : tool));
  };

  return (
    <>
      <div className="gp-shell">
        <LeftSidebar
          activeTool={activeTool}
          onToggleTool={handleToggleTool}
          showEnvironmentControls={showEnvironmentControls}
          compact={compact}
        >
          {children}
        </LeftSidebar>
      </div>
      {activeTool === 'info' && <Info />}
      {activeTool === 'teleport' && <Teleport />}
      <SceneFader />
    </>
  );
}

export default HudShell;

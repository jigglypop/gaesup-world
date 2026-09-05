import { useState, type ReactNode } from 'react';

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
  const showInfo = activeTool === 'info';
  const showTele = activeTool === 'teleport';

  return (
    <div className="gp-left">
      <div className="gp-glass gp-panel" style={{ width: '100%' }}>
        <div className="gp-panel-title">빠른 도구</div>
        <div className="gp-actionrow">
          <button
            type="button"
            aria-expanded={showInfo}
            className={`gp-btn${showInfo ? ' gp-btn--active' : ''}`}
            onClick={() => onToggleTool('info')}
          >
            <span>월드 설정</span>
            <span className="gp-key">{showInfo ? '켜짐' : '꺼짐'}</span>
          </button>
          <button
            type="button"
            aria-expanded={showTele}
            className={`gp-btn${showTele ? ' gp-btn--active' : ''}`}
            onClick={() => onToggleTool('teleport')}
          >
            <span>빠른 이동</span>
            <span className="gp-key">{showTele ? '켜짐' : '꺼짐'}</span>
          </button>
        </div>
      </div>
      {showEnvironmentControls && (
        <div className="gp-glass gp-panel" style={{ width: '100%' }}>
          <div className="gp-panel-title">월드 환경</div>
          <button
            type="button"
            aria-expanded={showWorldTools}
            className="gp-btn"
            onClick={() => setShowWorldTools((open) => !open)}
          >
            <span>{showWorldTools ? '환경 접기' : '환경 펼치기'}</span>
            <span className="gp-key">{showWorldTools ? '켜짐' : '꺼짐'}</span>
          </button>
          {showWorldTools && (
            <div className="gp-actionrow">
              <button
                className={`gp-btn${showSnow ? ' gp-btn--active' : ''}`}
                onClick={() => setShowSnow(!showSnow)}
              >
                <span>월드 눈</span>
                <span className="gp-key">{showSnow ? '켜짐' : '꺼짐'}</span>
              </button>
              <button
                className={`gp-btn${showFog ? ' gp-btn--active' : ''}`}
                onClick={() => setShowFog(!showFog)}
              >
                <span>장면 안개</span>
                <span className="gp-key">{showFog ? '켜짐' : '꺼짐'}</span>
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
  const [toolsOpen, setToolsOpen] = useState(!compact);
  const handleToggleTools = () => {
    setToolsOpen((open) => !open);
    setActiveTool(null);
  };
  const handleToggleTool = (tool: Exclude<HudTool, null>) => {
    setActiveTool((current) => (current === tool ? null : tool));
  };

  return (
    <>
      <div className="gp-shell">
        {compact && (
          <button
            type="button"
            className="gp-btn gp-world-tools-toggle"
            aria-expanded={toolsOpen}
            onClick={handleToggleTools}
          >
            {toolsOpen ? '도구 닫기' : '월드 도구'}
          </button>
        )}
        {toolsOpen && (
          <LeftSidebar
            activeTool={activeTool}
            onToggleTool={handleToggleTool}
            showEnvironmentControls={showEnvironmentControls}
            compact={compact}
          >
            {children}
          </LeftSidebar>
        )}
      </div>
      {activeTool === 'info' && <Info />}
      {activeTool === 'teleport' && <Teleport />}
      <SceneFader />
    </>
  );
}

export default HudShell;

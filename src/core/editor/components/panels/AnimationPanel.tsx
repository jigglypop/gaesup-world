import React, { useState } from 'react';
import { AnimationController } from '../../../animation/components/AnimationController';
import { AnimationPlayer } from '../../../animation/components/AnimationPlayer';
import { AnimationDebugPanel } from '../../../animation/components/AnimationDebugPanel';
import { AnimationPanelTab } from './types';

export function AnimationPanel() {
  const [activeTab, setActiveTab] = useState<AnimationPanelTab>('Player');
  const renderContent = () => {
    switch (activeTab) {
      case 'Player':
        return <div className="panel-content-wrapper"><AnimationPlayer /></div>;
      case 'Controller':
        return <div className="panel-content-wrapper"><AnimationController /></div>;
      case 'Debug':
        return <div className="panel-content-wrapper"><AnimationDebugPanel /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="tabbed-panel">
      <div className="panel-tabs">
        <button className={`panel-tab ${activeTab === 'Player' ? 'active' : ''}`} onClick={() => setActiveTab('Player')}>Player</button>
        <button className={`panel-tab ${activeTab === 'Controller' ? 'active' : ''}`} onClick={() => setActiveTab('Controller')}>Controller</button>
        <button className={`panel-tab ${activeTab === 'Debug' ? 'active' : ''}`} onClick={() => setActiveTab('Debug')}>Debug</button>
      </div>
      <div className="panel-tab-content">
        {renderContent()}
      </div>
    </div>
  );
} 
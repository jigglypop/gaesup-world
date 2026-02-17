import React, { useState } from 'react';

import { MotionPanelTab } from './types';
import { MotionController } from '../../../motions/controller/MotionController';
import { MotionDebugPanel } from '../../../motions/ui/MotionDebugPanel';

export function MotionPanel() {
  const [activeTab, setActiveTab] = useState<MotionPanelTab>('Controller');
  const renderContent = () => {
    switch (activeTab) {
      case 'Controller':
        return <div className="panel-content-wrapper"><MotionController /></div>;
      case 'Debug':
        return <div className="panel-content-wrapper"><MotionDebugPanel embedded /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="tabbed-panel">
      <div className="panel-tabs">
        <button className={`panel-tab ${activeTab === 'Controller' ? 'active' : ''}`} onClick={() => setActiveTab('Controller')}>Controller</button>
        <button className={`panel-tab ${activeTab === 'Debug' ? 'active' : ''}`} onClick={() => setActiveTab('Debug')}>Debug</button>
      </div>
      <div className="panel-tab-content">
        {renderContent()}
      </div>
    </div>
  );
} 
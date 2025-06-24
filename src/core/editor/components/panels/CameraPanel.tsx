import React, { useState } from 'react';
import { CameraController } from '../../../camera/components/CameraController';
import { CameraPresets } from '../../../camera/components/CameraPresets';
import { CameraDebugPanel } from '../../../camera/components/CameraDebugPanel';

type Tab = 'Controller' | 'Presets' | 'Debug';

export function CameraPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('Controller');

  const renderContent = () => {
    switch (activeTab) {
      case 'Controller':
        return <CameraController />;
      case 'Presets':
        return <CameraPresets />;
      case 'Debug':
        return <CameraDebugPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="tabbed-panel">
      <div className="panel-tabs">
        <button className={`panel-tab ${activeTab === 'Controller' ? 'active' : ''}`} onClick={() => setActiveTab('Controller')}>Controller</button>
        <button className={`panel-tab ${activeTab === 'Presets' ? 'active' : ''}`} onClick={() => setActiveTab('Presets')}>Presets</button>
        <button className={`panel-tab ${activeTab === 'Debug' ? 'active' : ''}`} onClick={() => setActiveTab('Debug')}>Debug</button>
      </div>
      <div className="panel-tab-content">
        {renderContent()}
      </div>
    </div>
  );
} 
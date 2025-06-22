import { useState } from 'react';
import { TABS, CONTROL_ITEMS, FEATURES, LOCATIONS } from './constants';
import { TabId } from './types';
import './styles.css';

export function InfoTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('controls');

  const renderControls = () => (
    <div className="content-blocks">
      <div className="content-block">
        <h4 className="block-title">키보드</h4>
        <ul className="block-list">
          {CONTROL_ITEMS.map((item, index) => (
            <li key={index} className="block-item">
              <span className="control-key">{item.key}</span>
              <span className="control-description">{item.description}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="content-block">
        <h4 className="block-title">마우스</h4>
        <ul className="block-list">
          <li className="block-item">
            <span className="control-key">클릭</span>
            <span className="control-description">이동 및 상호작용</span>
          </li>
          <li className="block-item">
            <span className="control-key">발판 클릭</span>
            <span className="control-description">카메라 포커싱</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderFeatures = () => {
    const coreFeatures = FEATURES.slice(0, 2);
    const systemFeatures = FEATURES.slice(2, 4);
    const techFeatures = FEATURES.slice(4, 6);

    return (
      <div className="content-blocks">
        <div className="content-block">
          <h4 className="block-title">핵심 기능</h4>
          <ul className="block-list">
            {coreFeatures.map((feature, index) => (
              <li key={index} className="feature-item">
                <span className="feature-icon">{feature.icon}</span>
                <div className="feature-content">
                  <div className="feature-name">{feature.title}</div>
                  <div className="feature-desc">{feature.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="content-block">
          <h4 className="block-title">시스템</h4>
          <ul className="block-list">
            {systemFeatures.map((feature, index) => (
              <li key={index} className="feature-item">
                <span className="feature-icon">{feature.icon}</span>
                <div className="feature-content">
                  <div className="feature-name">{feature.title}</div>
                  <div className="feature-desc">{feature.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="content-block">
          <h4 className="block-title">기술</h4>
          <ul className="block-list">
            {techFeatures.map((feature, index) => (
              <li key={index} className="feature-item">
                <span className="feature-icon">{feature.icon}</span>
                <div className="feature-content">
                  <div className="feature-name">{feature.title}</div>
                  <div className="feature-desc">{feature.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderLocations = () => {
    const baseLocations = LOCATIONS.slice(0, 3);
    const specialLocations = LOCATIONS.slice(3, 6);

    return (
      <div className="content-blocks">
        <div className="content-block">
          <h4 className="block-title">기본 구역</h4>
          <ul className="block-list">
            {baseLocations.map((location, index) => (
              <li key={index} className="location-item">
                <span className="location-icon">{location.icon}</span>
                <div className="location-content">
                  <div className="location-name">{location.name}</div>
                  <div className="location-description">{location.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="content-block">
          <h4 className="block-title">특수 구역</h4>
          <ul className="block-list">
            {specialLocations.map((location, index) => (
              <li key={index} className="location-item">
                <span className="location-icon">{location.icon}</span>
                <div className="location-content">
                  <div className="location-name">{location.name}</div>
                  <div className="location-description">{location.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'controls':
        return renderControls();
      case 'features':
        return renderFeatures();
      case 'locations':
        return renderLocations();
      default:
        return null;
    }
  };

  return (
    <div className="help-panel">
      <div className="tab-header">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : ''}`}
            onClick={() => setActiveTab(tab.id as TabId)}
          >
            {tab.emoji && <span>{tab.emoji}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
}

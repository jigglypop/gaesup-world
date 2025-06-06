import { useState } from 'react';
import '../styles.css';
import { TABS } from '../constants';
import { TabId } from '../types';
export function InfoTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('controls');
  return (
    <div className="help-panel">
      <div className="tab-header">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : ''}`}
            onClick={() => setActiveTab(tab.id as TabId)}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {activeTab === 'controls' && (
          <div>
            <h3>🎮 기본 조작</h3>
            <ul>
              <li>
                <strong>W/↑:</strong> 앞으로 이동
              </li>
              <li>
                <strong>S/↓:</strong> 뒤로 이동
              </li>
              <li>
                <strong>A/←:</strong> 왼쪽 이동
              </li>
              <li>
                <strong>D/→:</strong> 오른쪽 이동
              </li>
              <li>
                <strong>Space:</strong> 점프
              </li>
              <li>
                <strong>Shift:</strong> 달리기
              </li>
              <li>
                <strong>R:</strong> 탑승
              </li>
            </ul>
            <h4>🖱️ 마우스 조작</h4>
            <ul>
              <li>
                <strong>클릭:</strong> 이동 및 상호작용
              </li>
              <li>
                <strong>발판 클릭:</strong> 포커싱
              </li>
            </ul>
          </div>
        )}
        {activeTab === 'features' && (
          <div>
            <h3>✨ 주요 기능</h3>
            <ul>
              <li>
                <strong>🎯 발판 포커싱:</strong> 발판 클릭으로 카메라 줌
              </li>
              <li>
                <strong>🚗 탈것 시스템:</strong> 차량/비행기 탑승
              </li>
              <li>
                <strong>🗺️ 미니맵:</strong> 실시간 위치 표시
              </li>
              <li>
                <strong>📍 텔레포트:</strong> 즉시 이동
              </li>
              <li>
                <strong>🎮 물리 엔진:</strong> Rapier 기반
              </li>
            </ul>
            <h4>🔧 시스템</h4>
            <ul>
              <li>
                <strong>성능 최적화:</strong> 리렌더링 최소화
              </li>
              <li>
                <strong>연속 점프 방지:</strong> 지면 착지 후 점프
              </li>
              <li>
                <strong>카메라 추적:</strong> 부드러운 3인칭 시점
              </li>
            </ul>
          </div>
        )}
        {activeTab === 'locations' && (
          <div>
            <h3>📍 주요 위치</h3>
            <ul>
              <li>
                <strong>🏠 시작점:</strong> (0, 0, 0)
              </li>
              <li>
                <strong>🟫 발판 A:</strong> 기본 연습용
              </li>
              <li>
                <strong>🟫 발판 B~D:</strong> 점프 연습
              </li>
              <li>
                <strong>📐 계단:</strong> 높이 변화 체험
              </li>
              <li>
                <strong>🚗 차량:</strong> 좌측 구역
              </li>
              <li>
                <strong>✈️ 비행기:</strong> 우측/상단 구역
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

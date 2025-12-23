import React from 'react';

import { useUIConfigStore } from '../../../src/core/ui/stores/UIConfigStore';

export const SpeechBalloonSettings = () => {
  const { config, updateSpeechBalloonConfig } = useUIConfigStore();
  const speechConfig = config.speechBalloon;
  
  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Speech Balloon 설정</h3>
      <div className="info-group">
        <p>키 조작:</p>
        <ul style={{ fontSize: '12px', margin: '5px 0' }}>
          <li>T: 말풍선 켜기/끄기</li>
          <li>1: &quot;안녕하세요!&quot;</li>
          <li>2: &quot;이 세계에 오신 것을 환영합니다!&quot;</li>
          <li>3: &quot;함께 모험을 떠나볼까요?&quot;</li>
        </ul>
      </div>
      
      <div className="info-group">
        <label>
          <input
            type="checkbox"
            checked={speechConfig.enabled}
            onChange={(e) => updateSpeechBalloonConfig({ enabled: e.target.checked })}
          />
          활성화
        </label>
      </div>
      
      <div className="info-group">
        <label>글자 크기: {speechConfig.fontSize}</label>
        <input
          type="range"
          min="12"
          max="72"
          value={speechConfig.fontSize}
          onChange={(e) => updateSpeechBalloonConfig({ fontSize: Number(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
      
      <div className="info-group">
        <label>여백: {speechConfig.padding}</label>
        <input
          type="range"
          min="5"
          max="50"
          value={speechConfig.padding}
          onChange={(e) => updateSpeechBalloonConfig({ padding: Number(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
      
      <div className="info-group">
        <label>모서리 둥글기: {speechConfig.borderRadius}</label>
        <input
          type="range"
          min="0"
          max="30"
          value={speechConfig.borderRadius}
          onChange={(e) => updateSpeechBalloonConfig({ borderRadius: Number(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
      
      <div className="info-group">
        <label>최대 너비: {speechConfig.maxWidth}</label>
        <input
          type="range"
          min="100"
          max="500"
          value={speechConfig.maxWidth}
          onChange={(e) => updateSpeechBalloonConfig({ maxWidth: Number(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
      
      <div className="info-group">
        <label>배경색:</label>
        <input
          type="text"
          value={speechConfig.backgroundColor}
          onChange={(e) => updateSpeechBalloonConfig({ backgroundColor: e.target.value })}
          style={{ width: '100%', marginTop: '5px' }}
        />
      </div>
      
      <div className="info-group">
        <label>글자색:</label>
        <input
          type="text"
          value={speechConfig.textColor}
          onChange={(e) => updateSpeechBalloonConfig({ textColor: e.target.value })}
          style={{ width: '100%', marginTop: '5px' }}
        />
      </div>
      
      <div className="info-group">
        <label>크기 배율: {speechConfig.scaleMultiplier.toFixed(3)}</label>
        <input
          type="range"
          min="0.001"
          max="0.05"
          step="0.001"
          value={speechConfig.scaleMultiplier}
          onChange={(e) => updateSpeechBalloonConfig({ scaleMultiplier: Number(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}; 
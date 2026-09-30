import React from 'react';

import { useBuildingFields } from './state';
import { useBuildingStoreApi } from '../../../../building/stores/buildingStore';
import { BUILDING_FLAG_STYLE_OPTIONS, BUILDING_TREE_OPTIONS } from '../../../../building/types';
import { FieldColor, FieldRow } from '../../fields';
type NumericStepperProps = {
  label: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
};

function NumericStepper({ label, value, onDecrement, onIncrement }: NumericStepperProps) {
  return (
    <div className="building-panel__info-item">
      <span className="building-panel__info-label">{label}</span>
      <div className="building-panel__stepper">
        <button className="building-panel__stepper-btn" onClick={onDecrement}>
          -
        </button>
        <span className="building-panel__stepper-value">{value}</span>
        <button className="building-panel__stepper-btn" onClick={onIncrement}>
          +
        </button>
      </div>
    </div>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

function TextField({ label, value, placeholder, onChange }: TextFieldProps) {
  return (
    <div
      className="building-panel__info-item"
      style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}
    >
      <span className="building-panel__info-label">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '4px 6px',
          fontSize: '11px',
          background: 'var(--panel-bg, #1a1a2e)',
          border: '1px solid var(--border-color, #333)',
          borderRadius: '3px',
          color: 'inherit',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

const TREE_FIELDS = ['currentTreeKind', 'currentObjectPrimaryColor', 'currentObjectSecondaryColor'] as const;

export const TreeSettingsSection = React.memo(function TreeSettingsSection() {
  const { currentTreeKind, currentObjectPrimaryColor, currentObjectSecondaryColor } = useBuildingFields(TREE_FIELDS);
  const { setTreeKind, setObjectPrimaryColor, setObjectSecondaryColor } = useBuildingStoreApi().getState();
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">나무 프리셋</div>
      <div className="building-panel__grid">
        {BUILDING_TREE_OPTIONS.map((option) => (
          <button
            key={option.type}
            className={`building-panel__grid-btn ${currentTreeKind === option.type ? 'building-panel__grid-btn--active' : ''}`}
            onClick={() => setTreeKind(option.type)}
          >
            {option.labelKo}
          </button>
        ))}
      </div>
      <div className="building-panel__info">
        <FieldRow label="잎/꽃 색">
          <FieldColor value={currentObjectPrimaryColor} onChange={setObjectPrimaryColor} />
        </FieldRow>
        <FieldRow label="줄기 색">
          <FieldColor value={currentObjectSecondaryColor} onChange={setObjectSecondaryColor} />
        </FieldRow>
      </div>
    </div>
  );
});

const FIRE_FIELDS = ['currentFireIntensity', 'currentFireWidth', 'currentFireHeight', 'currentFireColor'] as const;

export const FireSettingsSection = React.memo(function FireSettingsSection() {
  const { currentFireIntensity, currentFireWidth, currentFireHeight, currentFireColor } = useBuildingFields(FIRE_FIELDS);
  const { setFireIntensity, setFireWidth, setFireHeight, setFireColor } = useBuildingStoreApi().getState();
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">불 설정</div>
      <div className="building-panel__info">
        <NumericStepper
          label="강도"
          value={currentFireIntensity.toFixed(1)}
          onDecrement={() => setFireIntensity(Math.max(0.5, currentFireIntensity - 0.5))}
          onIncrement={() => setFireIntensity(Math.min(3.0, currentFireIntensity + 0.5))}
        />
        <NumericStepper
          label="너비"
          value={`${currentFireWidth.toFixed(1)}m`}
          onDecrement={() => setFireWidth(Math.max(0.3, currentFireWidth - 0.2))}
          onIncrement={() => setFireWidth(Math.min(4.0, currentFireWidth + 0.2))}
        />
        <NumericStepper
          label="높이"
          value={`${currentFireHeight.toFixed(1)}m`}
          onDecrement={() => setFireHeight(Math.max(0.5, currentFireHeight - 0.3))}
          onIncrement={() => setFireHeight(Math.min(5.0, currentFireHeight + 0.3))}
        />
        <FieldRow label="색상">
          <FieldColor value={currentFireColor} onChange={setFireColor} />
        </FieldRow>
      </div>
    </div>
  );
});

const BILLBOARD_COLORS = [
  { value: '#00ff88', label: '초록' },
  { value: '#00aaff', label: '파랑' },
  { value: '#f59e0b', label: '앰버' },
  { value: '#ffffff', label: '흰색' },
  { value: '#ffdd00', label: '노랑' },
];

const BILLBOARD_FIELDS = [
  'currentBillboardScale',
  'currentBillboardOffsetY',
  'currentBillboardWidth',
  'currentBillboardHeight',
  'currentBillboardElevation',
  'currentBillboardIntensity',
  'currentBillboardText',
  'currentBillboardImageUrl',
  'currentBillboardColor',
] as const;

export const BillboardSettingsSection = React.memo(function BillboardSettingsSection() {
  const {
    currentBillboardScale,
    currentBillboardOffsetY,
    currentBillboardWidth,
    currentBillboardHeight,
    currentBillboardElevation,
    currentBillboardIntensity,
    currentBillboardText,
    currentBillboardImageUrl,
    currentBillboardColor,
  } = useBuildingFields(BILLBOARD_FIELDS);
  const {
    setBillboardScale,
    setBillboardOffsetY,
    setBillboardWidth,
    setBillboardHeight,
    setBillboardElevation,
    setBillboardIntensity,
    setBillboardText,
    setBillboardImageUrl,
    setBillboardColor,
  } = useBuildingStoreApi().getState();
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">간판 설정</div>
      <div className="building-panel__info">
        <NumericStepper
          label="크기"
          value={`${currentBillboardScale.toFixed(1)}x`}
          onDecrement={() => setBillboardScale(Math.max(0.2, currentBillboardScale - 0.2))}
          onIncrement={() => setBillboardScale(Math.min(10, currentBillboardScale + 0.2))}
        />
        <NumericStepper
          label="배치 높이"
          value={`${currentBillboardOffsetY.toFixed(2)}m`}
          onDecrement={() => setBillboardOffsetY(Math.max(-4, currentBillboardOffsetY - 0.25))}
          onIncrement={() => setBillboardOffsetY(Math.min(12, currentBillboardOffsetY + 0.25))}
        />
        <NumericStepper
          label="판넬 너비"
          value={currentBillboardWidth > 0 ? `${currentBillboardWidth.toFixed(2)}m` : '자동'}
          onDecrement={() => setBillboardWidth(Math.max(0, currentBillboardWidth - 0.25))}
          onIncrement={() => setBillboardWidth(Math.min(12, currentBillboardWidth + 0.25))}
        />
        <NumericStepper
          label="판넬 높이"
          value={`${currentBillboardHeight.toFixed(2)}m`}
          onDecrement={() => setBillboardHeight(Math.max(0.3, currentBillboardHeight - 0.25))}
          onIncrement={() => setBillboardHeight(Math.min(8, currentBillboardHeight + 0.25))}
        />
        <NumericStepper
          label="기둥 높이"
          value={`${currentBillboardElevation.toFixed(2)}m`}
          onDecrement={() => setBillboardElevation(Math.max(0, currentBillboardElevation - 0.25))}
          onIncrement={() => setBillboardElevation(Math.min(8, currentBillboardElevation + 0.25))}
        />
        <NumericStepper
          label="밝기"
          value={currentBillboardIntensity.toFixed(2)}
          onDecrement={() => setBillboardIntensity(Math.max(0, currentBillboardIntensity - 0.25))}
          onIncrement={() => setBillboardIntensity(Math.min(8, currentBillboardIntensity + 0.25))}
        />
        <TextField
          label="문구"
          value={currentBillboardText}
          onChange={setBillboardText}
          placeholder="표시할 문구..."
        />
        <TextField
          label="이미지 URL"
          value={currentBillboardImageUrl}
          onChange={setBillboardImageUrl}
          placeholder="https://..."
        />
        <div
          className="building-panel__info-item"
          style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}
        >
          <span className="building-panel__info-label">색상</span>
          <div className="building-panel__grid">
            {BILLBOARD_COLORS.map((color) => (
              <button
                key={color.value}
                className={`building-panel__grid-btn ${currentBillboardColor === color.value ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => setBillboardColor(color.value)}
                style={{ borderBottom: `3px solid ${color.value}` }}
              >
                {color.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

const FLAG_FIELDS = ['currentFlagStyle', 'currentFlagWidth', 'currentFlagHeight', 'currentFlagImageUrl'] as const;

export const FlagSettingsSection = React.memo(function FlagSettingsSection() {
  const { currentFlagStyle, currentFlagWidth, currentFlagHeight, currentFlagImageUrl } = useBuildingFields(FLAG_FIELDS);
  const { setFlagStyle, setFlagWidth, setFlagHeight, setFlagImageUrl } = useBuildingStoreApi().getState();
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">깃발 설정</div>
      <div className="building-panel__info">
        <div
          className="building-panel__info-item"
          style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}
        >
          <span className="building-panel__info-label">스타일</span>
          <div className="building-panel__grid">
            {BUILDING_FLAG_STYLE_OPTIONS.map(({ style: key, meta }) => (
              <button
                key={key}
                className={`building-panel__grid-btn ${currentFlagStyle === key ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => setFlagStyle(key)}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>
        <NumericStepper
          label="너비"
          value={`${currentFlagWidth}m`}
          onDecrement={() => setFlagWidth(Math.max(0.5, currentFlagWidth - 0.5))}
          onIncrement={() => setFlagWidth(Math.min(8, currentFlagWidth + 0.5))}
        />
        <NumericStepper
          label="높이"
          value={`${currentFlagHeight}m`}
          onDecrement={() => setFlagHeight(Math.max(0.5, currentFlagHeight - 0.5))}
          onIncrement={() => setFlagHeight(Math.min(6, currentFlagHeight + 0.5))}
        />
        <TextField
          label="이미지 URL"
          value={currentFlagImageUrl}
          onChange={setFlagImageUrl}
          placeholder="https://..."
        />
      </div>
    </div>
  );
});

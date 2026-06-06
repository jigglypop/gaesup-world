import type { CSSProperties } from 'react';

import {
  DEFAULT_CHARACTER_EQUIPMENT_PRESETS,
  applyCharacterEquipmentPreset,
  toggleCharacterWeapon,
  type CharacterEquipmentPreset,
} from '../../actionEquipment';
import { useCharacterStore } from '../../stores/characterStore';
import type { FaceStyle } from '../../types';

export type ActionEquipmentPanelProps = {
  presets?: CharacterEquipmentPreset[];
  weaponItemId?: string;
  className?: string;
  style?: CSSProperties;
};

const FACE_SEQUENCE: FaceStyle[] = ['default', 'smile', 'wink', 'surprised', 'sleepy'];
const OUTFIT_SLOT_COUNT = 8;

export function ActionEquipmentPanel({
  presets = DEFAULT_CHARACTER_EQUIPMENT_PRESETS,
  weaponItemId = 'starter-weapon-layer',
  className,
  style,
}: ActionEquipmentPanelProps = {}) {
  const face = useCharacterStore((state) => state.appearance.face);
  const outfits = useCharacterStore((state) => state.outfits);
  const setFace = useCharacterStore((state) => state.setFace);
  const resetAppearance = useCharacterStore((state) => state.resetAppearance);
  const equippedCount = Object.values(outfits).filter(Boolean).length;

  const cycleFace = () => {
    const index = FACE_SEQUENCE.indexOf(face);
    setFace(FACE_SEQUENCE[(index + 1) % FACE_SEQUENCE.length] ?? 'default');
  };

  return (
    <div className={className} style={{ ...panelStyle, ...style }}>
      <div style={headerStyle}>
        <span style={titleStyle}>장비 조작</span>
        <span style={metaStyle}>{equippedCount}/{OUTFIT_SLOT_COUNT}</span>
      </div>
      <div style={rowStyle}>
        <button type="button" style={buttonStyle} onClick={cycleFace}>
          표정: {face}
        </button>
        <button type="button" style={buttonStyle} onClick={() => toggleCharacterWeapon(weaponItemId)}>
          {outfits.weapon === weaponItemId ? '무기 해제' : '무기 장착'}
        </button>
      </div>
      <div style={rowStyle}>
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            style={buttonStyle}
            onClick={() => applyCharacterEquipmentPreset(preset)}
          >
            {preset.label}
          </button>
        ))}
        <button type="button" style={buttonStyle} onClick={resetAppearance}>
          초기화
        </button>
      </div>
    </div>
  );
}

const panelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  minWidth: 0,
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};

const titleStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
};

const metaStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--gp-text-dim, rgba(255,255,255,0.62))',
};

const rowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
};

const buttonStyle: CSSProperties = {
  minHeight: 30,
  padding: '0 9px',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: 6,
  background: 'rgba(255,255,255,0.07)',
  color: 'inherit',
  cursor: 'pointer',
  font: 'inherit',
  fontSize: 12,
};

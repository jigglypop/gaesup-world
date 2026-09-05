import { useState } from 'react';

import { usePlacementPresets } from '../../../../building/stores/presets';

/**
 * 현재 타일/벽/오브젝트 선택 조합을 사용자 프리셋으로 저장하고
 * 다시 적용하거나 삭제하는 섹션.
 */
export function PlacementPresetSection() {
  const presets = usePlacementPresets((state) => state.presets);
  const save = usePlacementPresets((state) => state.save);
  const apply = usePlacementPresets((state) => state.apply);
  const remove = usePlacementPresets((state) => state.remove);
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    save(name);
    setName('');
  };

  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">배치 프리셋</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          className="building-panel__text-input"
          type="text"
          placeholder="프리셋 이름"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSave();
          }}
        />
        <button className="building-panel__segment-btn" onClick={handleSave} disabled={!name.trim()}>
          저장
        </button>
      </div>
      {presets.map((preset) => (
        <div key={preset.name} style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <button
            className="building-panel__segment-btn"
            style={{ flex: 1, textAlign: 'left' }}
            onClick={() => apply(preset.name)}
            title="프리셋 적용"
          >
            {preset.name}
          </button>
          <button
            className="building-panel__segment-btn"
            onClick={() => remove(preset.name)}
            aria-label={`${preset.name} 삭제`}
          >
            삭제
          </button>
        </div>
      ))}
    </div>
  );
}

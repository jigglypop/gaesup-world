import type { MiniroomEngine } from './room';
import type { RoomSettings } from './roomTypes';

export function RoomCameraControls({ engine, settings, onChange, zoom, onZoom }: { engine: MiniroomEngine | null; settings: RoomSettings; onChange: (patch: Partial<RoomSettings>) => void; zoom: number; onZoom: (zoom: number) => void }) {
  return <details className="camera-options" open><summary>카메라 이동·Bloom 옵션</summary><div className="camera-options-grid">
    <fieldset><legend>카메라</legend>
      <label>투영<select aria-label="카메라 투영" value={settings.projection} onChange={event => onChange({ projection: event.target.value as RoomSettings['projection'] })}><option value="orthographic">직교 · 미니어처</option><option value="perspective">원근 · 공간감</option></select></label>
      <label>확대 <output>{zoom.toFixed(2)}×</output><input aria-label="카메라 확대" type="range" min={0.5} max={4} step={0.05} value={zoom} onChange={event => onZoom(Number(event.target.value))} /></label>
      <div className="camera-toggles">{([['pan', '화면 이동'], ['rotate', '회전'], ['damping', '부드럽게']] as const).map(([key, label]) => <label key={key}><input type="checkbox" checked={settings[key]} onChange={event => onChange({ [key]: event.target.checked })} />{label}</label>)}</div>
      <div className="camera-buttons">{([['left', '← 왼쪽'], ['up', '↑ 위쪽'], ['down', '↓ 아래쪽'], ['right', '→ 오른쪽'], ['rotateLeft', '↶ 회전'], ['rotateRight', '↷ 회전'], ['tiltUp', '시선 높이기'], ['tiltDown', '시선 낮추기'], ['focus', '내 아바타 중심']] as const).map(([action, label]) => <button key={action} onClick={() => engine?.moveCamera(action)} disabled={!engine || (action.includes('rotate') || action.includes('tilt') ? !settings.rotate : action !== 'focus' && !settings.pan)}>{label}</button>)}</div>
      <p>왼쪽·휠 버튼 드래그: 회전 · 오른쪽 드래그: 화면 이동 · 휠: 확대 · 짧은 클릭: 이동 · 터치 두 손가락: 이동·확대</p>
    </fieldset>
    <fieldset><legend>Bloom</legend>
      <label className="editor-checkbox"><input aria-label="Bloom 효과" type="checkbox" checked={settings.bloom} onChange={event => onChange({ bloom: event.target.checked })} />발광 번짐 효과</label>
      {([['bloomStrength', 'Bloom 강도', 2], ['bloomRadius', 'Bloom 반경', 1], ['bloomThreshold', 'Bloom 밝기 기준', 3]] as const).map(([key, label, max]) => <label key={key}>{label}<output>{settings[key].toFixed(2)}</output><input aria-label={label} type="range" min={0} max={max} step={0.05} value={settings[key]} onChange={event => onChange({ [key]: Number(event.target.value) })} /></label>)}
      <p>편집 화면에서 가구별 Bloom과 발광 세기를 설정합니다.</p>
      <label>아바타 이동 속도 <output>{settings.moveSpeed.toFixed(1)} m/s</output><input aria-label="아바타 이동 속도" type="range" min={1} max={8} step={0.5} value={settings.moveSpeed} onChange={event => onChange({ moveSpeed: Number(event.target.value) })} /></label>
    </fieldset>
  </div></details>;
}

import { useMemo, type CSSProperties } from 'react';

import {
  ActionEquipmentPanel,
  DEFAULT_CHARACTER_EQUIPMENT_PRESETS,
  GaesupRuntimeProvider,
  applyCharacterEquipmentPreset,
  createCameraPlugin,
  createCharacterPlugin,
  createGaesupRuntime,
  playCameraCinematic,
  toggleCharacterWeapon,
  useCharacterStore,
} from 'gaesup-world';

export function MinimalExamplePage() {
  const runtime = useMemo(
    () => createGaesupRuntime({ plugins: [createCameraPlugin(), createCharacterPlugin()] }),
    [],
  );
  const appearance = useCharacterStore((state) => state.appearance);
  const outfits = useCharacterStore((state) => state.outfits);

  const runMinimalCinematic = () => {
    void playCameraCinematic([
      { kind: 'expression', face: 'surprised', durationMs: 180 },
      { kind: 'equip', slot: 'weapon', itemId: 'starter-weapon-layer', durationMs: 180 },
      { kind: 'fade', direction: 'inOut', durationMs: 160 },
      { kind: 'event', name: 'minimal:complete', payload: { route: '/minimal' }, durationMs: 1 },
    ], {
      restoreOnComplete: false,
      onEvent: () => {
        useCharacterStore.getState().setFace('smile');
      },
    });
  };

  return (
    <GaesupRuntimeProvider runtime={runtime}>
      <main style={pageStyle}>
        <section style={panelStyle}>
          <div style={eyebrowStyle}>설치 패키지 사용 예제</div>
          <h1 style={titleStyle}>미니멀 개섭 런타임</h1>
          <p style={copyStyle}>
            공개 패키지 엔트리만 사용합니다. 월드 캔버스, 물리 씬, 에디터 셸 없이 실행됩니다.
          </p>
          <ActionEquipmentPanel />
          <div style={buttonRowStyle}>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => applyCharacterEquipmentPreset(DEFAULT_CHARACTER_EQUIPMENT_PRESETS[0]!)}
            >
              프리셋 적용
            </button>
            <button type="button" style={buttonStyle} onClick={() => toggleCharacterWeapon()}>
              무기 토글
            </button>
            <button type="button" style={buttonStyle} onClick={runMinimalCinematic}>
              액션 실행
            </button>
          </div>
        </section>
        <section style={stateStyle}>
          <h2 style={subtitleStyle}>캐릭터 상태</h2>
          <pre style={preStyle}>
            {JSON.stringify({ appearance, outfits }, null, 2)}
          </pre>
        </section>
      </main>
    </GaesupRuntimeProvider>
  );
}

const pageStyle = {
  minHeight: '100vh',
  padding: '104px 24px 32px',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 520px) minmax(0, 1fr)',
  gap: 16,
  background: '#111827',
  color: '#f8fafc',
  fontFamily: 'system-ui, sans-serif',
} satisfies CSSProperties;

const panelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  padding: 18,
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.06)',
} satisfies CSSProperties;

const stateStyle = {
  ...panelStyle,
  minHeight: 280,
} satisfies CSSProperties;

const eyebrowStyle = {
  color: '#7ddc83',
  fontSize: 12,
  fontWeight: 800,
  textTransform: 'uppercase',
} satisfies CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: 26,
  lineHeight: 1.15,
} satisfies CSSProperties;

const subtitleStyle = {
  margin: 0,
  fontSize: 16,
} satisfies CSSProperties;

const copyStyle = {
  margin: 0,
  color: 'rgba(248,250,252,0.72)',
  lineHeight: 1.55,
} satisfies CSSProperties;

const buttonRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
} satisfies CSSProperties;

const buttonStyle = {
  minHeight: 34,
  padding: '0 12px',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 6,
  background: 'rgba(125,220,131,0.14)',
  color: '#f8fafc',
  cursor: 'pointer',
} satisfies CSSProperties;

const preStyle = {
  margin: 0,
  minHeight: 220,
  overflow: 'auto',
  padding: 12,
  borderRadius: 6,
  background: 'rgba(0,0,0,0.24)',
  color: '#dbeafe',
  fontSize: 12,
  lineHeight: 1.5,
} satisfies CSSProperties;

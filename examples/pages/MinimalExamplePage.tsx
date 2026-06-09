import { useMemo, type CSSProperties } from 'react';

import {
  ActionEquipmentPanel,
  CameraController,
  CameraDebugPanel,
  CameraPresets,
  CameraSettingsTab,
  DEFAULT_CHARACTER_EQUIPMENT_PRESETS,
  GaesupRuntimeProvider,
  applyCharacterEquipmentPreset,
  createCameraPlugin,
  createCharacterPlugin,
  createGaesupRuntime,
  playCameraCinematic,
  toggleCharacterWeapon,
  useCharacterStore,
  type ActionEquipmentPanelRenderers,
  type CameraControllerRenderers,
  type CameraDebugPanelRenderers,
  type CameraPresetsRenderers,
  type CameraSettingsRenderers,
  type CameraSettingsSection,
} from 'gaesup-world';

export function MinimalExamplePage() {
  const runtime = useMemo(
    () => createGaesupRuntime({ plugins: [createCameraPlugin(), createCharacterPlugin()] }),
    [],
  );
  const appearance = useCharacterStore((state) => state.appearance);
  const outfits = useCharacterStore((state) => state.outfits);
  const actionEquipmentRenderers = useMemo<ActionEquipmentPanelRenderers>(
    () => ({
      header: (panel) => (
        <div style={equipmentHeaderStyle}>
          <strong>{panel.labels.title}</strong>
          <span>{panel.metaLabel}</span>
        </div>
      ),
    }),
    [],
  );
  const cameraControllerRenderers = useMemo<CameraControllerRenderers>(
    () => ({
      modeButton: (controller, mode, active) => (
        <button
          key={mode.value}
          type="button"
          style={active ? activeCameraButtonStyle : cameraButtonStyle}
          onClick={() => controller.actions.selectMode(mode.value)}
        >
          {mode.label}
        </button>
      ),
    }),
    [],
  );
  const cameraPresetRenderers = useMemo<CameraPresetsRenderers>(
    () => ({
      presetButton: (controller, preset, active) => (
        <button
          key={preset.id}
          type="button"
          style={active ? activeCameraButtonStyle : cameraButtonStyle}
          onClick={() => controller.actions.applyPreset(preset)}
        >
          {preset.name}
        </button>
      ),
    }),
    [],
  );
  const cameraDebugRenderers = useMemo<CameraDebugPanelRenderers>(
    () => ({
      field: (_, field) => (
        <div key={field.key} style={debugFieldStyle}>
          <span>{field.label}</span>
          <strong>{field.formattedValue}</strong>
        </div>
      ),
    }),
    [],
  );
  const cameraSettingsRenderers = useMemo<CameraSettingsRenderers>(
    () => ({
      mode: (settings) => (
        <div style={cameraSettingsModeStyle}>
          Control: {settings.mode.control ?? settings.labels.fallbackMode}
        </div>
      ),
      section: (_, section, children) => (
        <div key={section.key} style={cameraSettingsSectionStyle}>
          <strong>{section.title}</strong>
          {children}
        </div>
      ),
    }),
    [],
  );

  const runMinimalCinematic = () => {
    void playCameraCinematic(
      [
        { kind: 'expression', face: 'surprised', durationMs: 180 },
        { kind: 'equip', slot: 'weapon', itemId: 'starter-weapon-layer', durationMs: 180 },
        { kind: 'fade', direction: 'inOut', durationMs: 160 },
        { kind: 'event', name: 'minimal:complete', payload: { route: '/minimal' }, durationMs: 1 },
      ],
      {
        restoreOnComplete: false,
        onEvent: () => {
          useCharacterStore.getState().setFace('smile');
        },
      },
    );
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
          <ActionEquipmentPanel
            labels={{ title: '빠른 장비' }}
            renderers={actionEquipmentRenderers}
            formatFaceLabel={(_, label) => `표정: ${label}`}
            formatWeaponLabel={(weaponEquipped) => (weaponEquipped ? '무기 해제' : '무기 장착')}
          />
          <section style={toolGroupStyle}>
            <h2 style={subtitleStyle}>카메라</h2>
            <CameraController
              showTitle
              labels={{ title: '카메라 모드' }}
              renderers={cameraControllerRenderers}
            />
            <CameraSettingsTab
              sections={minimalCameraSettingsSections}
              renderers={cameraSettingsRenderers}
            />
            <CameraPresets renderers={cameraPresetRenderers} />
            <CameraDebugPanel
              fields={[
                { key: 'mode', label: 'Mode', enabled: true, format: 'text' },
                { key: 'fov', label: 'FOV', enabled: true, format: 'angle', precision: 0 },
              ]}
              customFields={[
                {
                  key: 'outfit-count',
                  label: 'Outfits',
                  getValue: () => Object.values(outfits).filter(Boolean).length,
                  format: 'number',
                  precision: 0,
                },
              ]}
              renderers={cameraDebugRenderers}
            />
          </section>
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
          <pre style={preStyle}>{JSON.stringify({ appearance, outfits }, null, 2)}</pre>
        </section>
      </main>
    </GaesupRuntimeProvider>
  );
}

const pageStyle = {
  minHeight: '100vh',
  boxSizing: 'border-box',
  padding: '104px 24px 32px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
  gap: 16,
  alignItems: 'start',
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

const cameraButtonStyle = {
  minHeight: 32,
  padding: '0 10px',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 6,
  background: 'rgba(255,255,255,0.08)',
  color: '#f8fafc',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 700,
} satisfies CSSProperties;

const activeCameraButtonStyle = {
  ...cameraButtonStyle,
  border: '1px solid rgba(125,220,131,0.45)',
  background: 'rgba(125,220,131,0.18)',
} satisfies CSSProperties;

const toolGroupStyle = {
  display: 'grid',
  gap: 8,
} satisfies CSSProperties;

const debugFieldStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6,
  background: 'rgba(255,255,255,0.05)',
  color: '#f8fafc',
  fontSize: 12,
} satisfies CSSProperties;

const cameraSettingsModeStyle = {
  color: '#dbeafe',
  fontSize: 12,
  fontWeight: 800,
} satisfies CSSProperties;

const cameraSettingsSectionStyle = {
  display: 'grid',
  gap: 6,
  padding: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6,
  background: 'rgba(255,255,255,0.05)',
} satisfies CSSProperties;

const equipmentHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  color: '#f8fafc',
  fontSize: 12,
  fontWeight: 800,
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

const minimalCameraSettingsSections = [
  {
    key: 'minimal-lens',
    title: 'Lens',
    fields: [
      {
        key: 'minimal-fov',
        label: 'FOV',
        kind: 'range',
        path: 'fov',
        min: 30,
        max: 120,
        step: 5,
        suffix: 'deg',
        defaultValue: 75,
      },
      {
        key: 'minimal-focus',
        label: 'Focus',
        kind: 'checkbox',
        path: 'enableFocus',
        defaultValue: false,
      },
    ],
  },
] satisfies readonly CameraSettingsSection[];

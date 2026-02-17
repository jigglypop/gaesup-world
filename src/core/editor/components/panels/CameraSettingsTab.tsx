import React, { useCallback } from 'react';

import { useGaesupStore } from '../../../stores/gaesupStore';

function RangeRow({ label, min, max, step, value, suffix, onChange }: {
  label: string; min: number; max: number; step: number; value: number;
  suffix?: string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#fff' }}>
      <span style={{ width: 60, flexShrink: 0, color: 'rgba(255,255,255,0.7)' }}>{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: '#0078d4' }}
      />
      <span style={{ width: 44, textAlign: 'right', fontFamily: 'monospace', fontSize: 11 }}>
        {typeof step === 'number' && step < 1 ? value.toFixed(2) : value}{suffix ?? ''}
      </span>
    </div>
  );
}

function CheckRow({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#fff' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ accentColor: '#0078d4' }} />
      <span>{label}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '8px 10px',
      border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export function CameraSettingsTab() {
  const cameraOption = useGaesupStore((s) => s.cameraOption);
  const setCameraOption = useGaesupStore((s) => s.setCameraOption);
  const mode = useGaesupStore((s) => s.mode);

  const update = useCallback((key: string, value: number | boolean) => {
    setCameraOption({ [key]: value });
  }, [setCameraOption]);

  const updateSmoothing = useCallback((key: string, value: number) => {
    setCameraOption({ smoothing: { ...cameraOption.smoothing, [key]: value } });
  }, [setCameraOption, cameraOption.smoothing]);

  const dist = (key: string) => (cameraOption as Record<string, unknown>)[key] as number ?? 0;

  return (
    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: -4 }}>
        Mode: {mode.control ?? 'thirdPerson'}
      </div>

      <Section title="Distance">
        <RangeRow label="X" min={-50} max={50} step={1} value={dist('xDistance')} onChange={(v) => update('xDistance', v)} />
        <RangeRow label="Y" min={0} max={50} step={1} value={dist('yDistance')} onChange={(v) => update('yDistance', v)} />
        <RangeRow label="Z" min={-50} max={50} step={1} value={dist('zDistance')} onChange={(v) => update('zDistance', v)} />
      </Section>

      <Section title="FOV / Smoothing">
        <RangeRow label="FOV" min={30} max={120} step={5} value={cameraOption.fov ?? 75} suffix="deg" onChange={(v) => update('fov', v)} />
        <RangeRow label="Pos" min={0.01} max={1} step={0.01} value={cameraOption.smoothing?.position ?? 0.1} onChange={(v) => updateSmoothing('position', v)} />
        <RangeRow label="Rot" min={0.01} max={1} step={0.01} value={cameraOption.smoothing?.rotation ?? 0.1} onChange={(v) => updateSmoothing('rotation', v)} />
        <RangeRow label="FOV Sm" min={0.01} max={1} step={0.01} value={cameraOption.smoothing?.fov ?? 0.2} onChange={(v) => updateSmoothing('fov', v)} />
      </Section>

      <Section title="Zoom">
        <CheckRow label="Enable Zoom" checked={cameraOption.enableZoom ?? false} onChange={(v) => update('enableZoom', v)} />
        <RangeRow label="Speed" min={0.0001} max={0.01} step={0.0001} value={cameraOption.zoomSpeed ?? 0.001} onChange={(v) => update('zoomSpeed', v)} />
        <RangeRow label="Min" min={0.1} max={2} step={0.1} value={cameraOption.minZoom ?? 0.5} onChange={(v) => update('minZoom', v)} />
        <RangeRow label="Max" min={1} max={5} step={0.1} value={cameraOption.maxZoom ?? 2} onChange={(v) => update('maxZoom', v)} />
      </Section>

      <Section title="Options">
        <CheckRow label="Collision" checked={cameraOption.enableCollision ?? false} onChange={(v) => update('enableCollision', v)} />
        <CheckRow label="Focus Mode" checked={cameraOption.enableFocus ?? false} onChange={(v) => update('enableFocus', v)} />
        <RangeRow label="Focus Dist" min={1} max={50} step={1} value={cameraOption.focusDistance ?? 15} onChange={(v) => update('focusDistance', v)} />
        <RangeRow label="Max Dist" min={5} max={100} step={1} value={cameraOption.maxDistance ?? 50} onChange={(v) => update('maxDistance', v)} />
      </Section>

      <Section title="Bounds">
        <RangeRow label="Min Y" min={-10} max={50} step={1} value={cameraOption.bounds?.minY ?? 2} onChange={(v) => setCameraOption({ bounds: { ...cameraOption.bounds, minY: v } })} />
        <RangeRow label="Max Y" min={5} max={100} step={1} value={cameraOption.bounds?.maxY ?? 50} onChange={(v) => setCameraOption({ bounds: { ...cameraOption.bounds, maxY: v } })} />
      </Section>
    </div>
  );
}

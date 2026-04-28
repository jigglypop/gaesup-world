import React, { useCallback, useMemo, useState } from 'react';

import { useAssetStore } from '../../../../assets';
import {
  createContentBundleFromSaveSystem,
  validateContentBundle,
  type ContentBundle,
  type ContentBundleValidation,
} from '../../../../content';
import { SEED_GAMEPLAY_EVENTS } from '../../../../gameplay';
import { getSaveSystem } from '../../../../save';
import './styles.css';

type StudioStatusKind = 'idle' | 'success' | 'error';

type StudioStatus = {
  kind: StudioStatusKind;
  message: string;
};

const DEFAULT_BUNDLE_ID = 'studio-social-world';
const DEFAULT_BUNDLE_NAME = 'Studio Social World';
const DEFAULT_VERSION = '1.0.0';

const downloadJson = (filename: string, data: unknown): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export function StudioPanel() {
  const assetIds = useAssetStore((state) => state.ids);
  const assetRecords = useAssetStore((state) => state.records);
  const assets = useMemo(
    () => assetIds.map((id) => assetRecords[id]).filter((asset): asset is NonNullable<typeof asset> => Boolean(asset)),
    [assetIds, assetRecords],
  );

  const [slot, setSlot] = useState('main');
  const [bundleId, setBundleId] = useState(DEFAULT_BUNDLE_ID);
  const [bundleName, setBundleName] = useState(DEFAULT_BUNDLE_NAME);
  const [version, setVersion] = useState(DEFAULT_VERSION);
  const [slots, setSlots] = useState<string[]>([]);
  const [status, setStatus] = useState<StudioStatus>({ kind: 'idle', message: 'Ready' });
  const [validation, setValidation] = useState<ContentBundleValidation | null>(null);

  const buildBundle = useCallback((): ContentBundle => {
    return createContentBundleFromSaveSystem(getSaveSystem(), assets, {
      id: bundleId,
      name: bundleName,
      version,
      gameplayEvents: SEED_GAMEPLAY_EVENTS,
    });
  }, [assets, bundleId, bundleName, version]);

  const refreshSlots = useCallback(async () => {
    const nextSlots = await getSaveSystem().list();
    setSlots(nextSlots);
    setStatus({ kind: 'success', message: `Loaded ${nextSlots.length} save slot(s)` });
  }, []);

  const saveWorld = useCallback(async () => {
    await getSaveSystem().save(slot);
    setStatus({ kind: 'success', message: `Saved slot "${slot}"` });
    await refreshSlots();
  }, [refreshSlots, slot]);

  const loadWorld = useCallback(async () => {
    const loaded = await getSaveSystem().load(slot);
    setStatus({
      kind: loaded ? 'success' : 'error',
      message: loaded ? `Loaded slot "${slot}"` : `No save data in slot "${slot}"`,
    });
  }, [slot]);

  const validateWorld = useCallback(() => {
    const result = validateContentBundle(buildBundle());
    setValidation(result);
    setStatus({
      kind: result.ok ? 'success' : 'error',
      message: result.ok ? 'Bundle is valid' : `Bundle has ${result.errors.length} error(s)`,
    });
  }, [buildBundle]);

  const exportBundle = useCallback(() => {
    const bundle = buildBundle();
    const result = validateContentBundle(bundle);
    setValidation(result);
    if (!result.ok) {
      setStatus({ kind: 'error', message: 'Fix bundle validation before export' });
      return;
    }
    downloadJson(`${bundle.id}-${bundle.version}.bundle.json`, bundle);
    setStatus({ kind: 'success', message: 'Exported content bundle JSON' });
  }, [buildBundle]);

  return (
    <div className="studio-panel">
      <section className="studio-panel__section">
        <div className="studio-panel__title">World Save</div>
        <label className="studio-panel__field">
          <span>Slot</span>
          <input value={slot} onChange={(event) => setSlot(event.target.value || 'main')} />
        </label>
        <div className="studio-panel__actions">
          <button type="button" onClick={() => { void saveWorld(); }}>Save</button>
          <button type="button" onClick={() => { void loadWorld(); }}>Load</button>
          <button type="button" onClick={() => { void refreshSlots(); }}>Refresh</button>
        </div>
        {slots.length > 0 && (
          <div className="studio-panel__chips">
            {slots.map((saveSlot) => (
              <button key={saveSlot} type="button" onClick={() => setSlot(saveSlot)}>
                {saveSlot}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="studio-panel__section">
        <div className="studio-panel__title">Content Bundle</div>
        <label className="studio-panel__field">
          <span>Bundle ID</span>
          <input value={bundleId} onChange={(event) => setBundleId(event.target.value)} />
        </label>
        <label className="studio-panel__field">
          <span>Name</span>
          <input value={bundleName} onChange={(event) => setBundleName(event.target.value)} />
        </label>
        <label className="studio-panel__field">
          <span>Version</span>
          <input value={version} onChange={(event) => setVersion(event.target.value)} />
        </label>
        <div className="studio-panel__meta">
          {assets.length} asset(s), {SEED_GAMEPLAY_EVENTS.length} gameplay event(s),{' '}
          {Array.from(getSaveSystem().getBindings()).length} save domain(s)
        </div>
        <div className="studio-panel__actions">
          <button type="button" onClick={validateWorld}>Validate</button>
          <button type="button" onClick={exportBundle}>Export JSON</button>
        </div>
      </section>

      <section className="studio-panel__section">
        <div className="studio-panel__title">Status</div>
        <div className={`studio-panel__status studio-panel__status--${status.kind}`}>
          {status.message}
        </div>
        {validation && !validation.ok && (
          <ul className="studio-panel__errors">
            {validation.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

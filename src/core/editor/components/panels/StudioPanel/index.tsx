import React, { useCallback, useMemo, useState } from 'react';

import { useAssetStore, type AssetRecord } from '../../../../assets';
import {
  createContentBundleFromSaveSystem,
  validateContentBundle,
  type ContentBundle,
  type ContentBundleValidation,
} from '../../../../content';
import { SEED_GAMEPLAY_EVENTS, type GameplayEventBlueprint } from '../../../../gameplay';
import { getSaveSystem } from '../../../../save';
import type { EditorPanelBaseProps } from '../types';
import './styles.css';

type StudioStatusKind = 'idle' | 'success' | 'error';

type StudioStatus = {
  kind: StudioStatusKind;
  message: string;
};

const DEFAULT_BUNDLE_ID = 'studio-social-world';
const DEFAULT_BUNDLE_NAME = 'Studio Social World';
const DEFAULT_VERSION = '1.0.0';

export type StudioPanelBundleContext = {
  assets: AssetRecord[];
  bundleId: string;
  bundleName: string;
  version: string;
  gameplayEvents: GameplayEventBlueprint[];
};

export type StudioPanelProps = EditorPanelBaseProps & {
  gameplayEvents?: GameplayEventBlueprint[];
  defaultSlot?: string;
  defaultBundleId?: string;
  defaultBundleName?: string;
  defaultVersion?: string;
  buildBundle?: (context: StudioPanelBundleContext) => ContentBundle;
  validateBundle?: (bundle: ContentBundle) => ContentBundleValidation;
  onSaveWorld?: (slot: string) => void | Promise<void>;
  onLoadWorld?: (slot: string) => boolean | void | Promise<boolean | void>;
  onExportBundle?: (bundle: ContentBundle) => void | Promise<void>;
};

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

export function StudioPanel({
  gameplayEvents = SEED_GAMEPLAY_EVENTS,
  defaultSlot = 'main',
  defaultBundleId = DEFAULT_BUNDLE_ID,
  defaultBundleName = DEFAULT_BUNDLE_NAME,
  defaultVersion = DEFAULT_VERSION,
  buildBundle: buildBundleProp,
  validateBundle = validateContentBundle,
  onSaveWorld,
  onLoadWorld,
  onExportBundle,
  className = '',
  style,
  children,
}: StudioPanelProps) {
  const assetIds = useAssetStore((state) => state.ids);
  const assetRecords = useAssetStore((state) => state.records);
  const assets = useMemo(
    () => assetIds.map((id) => assetRecords[id]).filter((asset): asset is NonNullable<typeof asset> => Boolean(asset)),
    [assetIds, assetRecords],
  );

  const [slot, setSlot] = useState(defaultSlot);
  const [bundleId, setBundleId] = useState(defaultBundleId);
  const [bundleName, setBundleName] = useState(defaultBundleName);
  const [version, setVersion] = useState(defaultVersion);
  const [slots, setSlots] = useState<string[]>([]);
  const [status, setStatus] = useState<StudioStatus>({ kind: 'idle', message: 'Ready' });
  const [validation, setValidation] = useState<ContentBundleValidation | null>(null);

  const buildBundle = useCallback((): ContentBundle => {
    const context: StudioPanelBundleContext = {
      assets,
      bundleId,
      bundleName,
      version,
      gameplayEvents,
    };
    if (buildBundleProp) return buildBundleProp(context);
    return createContentBundleFromSaveSystem(getSaveSystem(), assets, {
      id: bundleId,
      name: bundleName,
      version,
      gameplayEvents,
    });
  }, [assets, buildBundleProp, bundleId, bundleName, gameplayEvents, version]);

  const refreshSlots = useCallback(async () => {
    const nextSlots = await getSaveSystem().list();
    setSlots(nextSlots);
    setStatus({ kind: 'success', message: `Loaded ${nextSlots.length} save slot(s)` });
  }, []);

  const saveWorld = useCallback(async () => {
    if (onSaveWorld) {
      await onSaveWorld(slot);
    } else {
      await getSaveSystem().save(slot);
    }
    setStatus({ kind: 'success', message: `Saved slot "${slot}"` });
    await refreshSlots();
  }, [onSaveWorld, refreshSlots, slot]);

  const loadWorld = useCallback(async () => {
    const loadResult = onLoadWorld
      ? await onLoadWorld(slot)
      : await getSaveSystem().load(slot);
    const loaded = loadResult === undefined ? true : Boolean(loadResult);
    setStatus({
      kind: loaded ? 'success' : 'error',
      message: loaded ? `Loaded slot "${slot}"` : `No save data in slot "${slot}"`,
    });
  }, [onLoadWorld, slot]);

  const validateWorld = useCallback(() => {
    const result = validateBundle(buildBundle());
    setValidation(result);
    setStatus({
      kind: result.ok ? 'success' : 'error',
      message: result.ok ? 'Bundle is valid' : `Bundle has ${result.errors.length} error(s)`,
    });
  }, [buildBundle, validateBundle]);

  const exportBundle = useCallback(() => {
    const bundle = buildBundle();
    const result = validateBundle(bundle);
    setValidation(result);
    if (!result.ok) {
      setStatus({ kind: 'error', message: 'Fix bundle validation before export' });
      return;
    }
    if (onExportBundle) {
      void onExportBundle(bundle);
    } else {
      downloadJson(`${bundle.id}-${bundle.version}.bundle.json`, bundle);
    }
    setStatus({ kind: 'success', message: 'Exported content bundle JSON' });
  }, [buildBundle, onExportBundle, validateBundle]);

  return (
    <div className={`studio-panel ${className}`} style={style}>
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
          {assets.length} asset(s), {gameplayEvents.length} gameplay event(s),{' '}
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
      {children}
    </div>
  );
}

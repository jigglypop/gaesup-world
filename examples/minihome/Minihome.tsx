import './minihome.css';

import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { DialogBox, GaesupWorld, InteractionPrompt, ToastHost, useAmbientBgm, useAutoSave, useGameTime, useLoadOnMount } from 'gaesup-world';

import { Guestbook } from './Guestbook';
import { minimeOf, Profile } from './Profile';
import { Scene, type SceneSettings } from './Scene';
import { StatusPanel } from './StatusPanel';
import { countVisit, useStored } from './stored';
import { createVillage } from './village';
import { createMinihomeRuntime, modelUrl, type MinimeModel } from './world';
import { WorldLoading } from './WorldLoading';

// The editor panel loads only when the 꾸미기 tab opens.
const BuildingUI = lazy(() => import('gaesup-world/building').then((module) => ({ default: module.BuildingUI })));

/** A fixed, north-facing high angle, like a diorama seen from the south. */
const CAMERA = { type: 'thirdPerson', xDistance: -4, yDistance: 10, zDistance: -10, fov: 42 } as const;

type Tab = 'home' | 'decorate' | 'guestbook';
const TABS: { id: Tab; label: string }[] = [
  { id: 'home', label: '홈' },
  { id: 'decorate', label: '꾸미기' },
  { id: 'guestbook', label: '방명록' },
];
const KEYS = [['WASD', '이동'], ['Shift', '달리기'], ['Space', '점프'], ['E', '대화']] as const;

function Clock() {
  const time = useGameTime();
  const day = time.hour >= 6 && time.hour < 18;
  return <span className="mh-chip">{day ? '☀️' : '🌙'} {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}</span>;
}

/** Loads the saved island once and keeps saving it; lives under the world so it uses this runtime's save system. */
function Persistence() {
  useLoadOnMount();
  useAutoSave({ intervalMs: 60_000 });
  return null;
}

function Bgm({ enabled }: { enabled: boolean }) {
  useAmbientBgm(enabled);
  return null;
}

export default function Minihome() {
  const [runtime] = useState(createMinihomeRuntime);
  useEffect(() => {
    runtime.setup().catch((error: unknown) => console.error(error));
    return () => {
      runtime.dispose().catch((error: unknown) => console.error(error));
    };
  }, [runtime]);

  const [visits] = useState(countVisit);
  const [minime, setMinime] = useStored<MinimeModel>('minime', 'man');
  const [settings, setSettings] = useStored<SceneSettings>('scene', { quality: 'auto', postProcessing: false, idleThrottle: true });
  const [tab, setTab] = useState<Tab>('home');
  const [bgm, setBgm] = useState(false);
  const urls = useMemo(() => ({ characterUrl: modelUrl(minime) }), [minime]);
  const changeSettings = useCallback((next: Partial<SceneSettings>) => setSettings((current) => ({ ...current, ...next })), [setSettings]);
  const resetIsland = () => runtime.buildingStore.getState().hydrate(createVillage());
  const me = minimeOf(minime);

  return (
    <GaesupWorld runtime={runtime} urls={urls} cameraOption={CAMERA}>
      <Persistence />
      <Bgm enabled={bgm} />
      <div className="mh-page">
        <div className="mh-frame">
          <header className="mh-head">
            <div className="mh-counter">
              TODAY <b>{visits.today.toLocaleString()}</b>
              <span>|</span>
              TOTAL <b>{visits.total.toLocaleString()}</b>
            </div>
            <h1>
              개숲이의 미니홈피
              <small>미니홈피 섬 · gaesup-world</small>
            </h1>
            <div className="mh-head-actions">
              <button className="mh-chip-button" aria-pressed={bgm} onClick={() => setBgm(!bgm)}>
                {bgm ? '🔊 BGM 켜짐' : '🔈 BGM 꺼짐'}
              </button>
            </div>
          </header>

          <div className="mh-body">
            <aside className="mh-side">
              <Profile minime={minime} onMinime={setMinime} />
            </aside>

            <main className="mh-stage">
              <div className="mh-canvas">
                <Scene {...settings} />
              </div>
              <WorldLoading />
              <div className="mh-hud">
                <div className="mh-hud-top">
                  <Clock />
                  <span className="mh-chip">🏝️ 미니홈피 섬</span>
                </div>
                <div className="mh-keys">
                  {KEYS.map(([key, label]) => (
                    <span key={key}><kbd>{key}</kbd>{label}</span>
                  ))}
                </div>
              </div>
              <InteractionPrompt enabled={tab === 'home'} />
              <DialogBox />
              <ToastHost position="top-center" />
              {tab === 'decorate' && (
                <Suspense fallback={null}>
                  <BuildingUI onClose={() => setTab('home')} />
                  <button className="mh-reset" onClick={resetIsland}>섬 처음 모습으로</button>
                </Suspense>
              )}
              {tab === 'guestbook' && <Guestbook author="개숲이" emoji={me.emoji} onClose={() => setTab('home')} />}
            </main>

            <nav className="mh-tabs" aria-label="미니홈피 메뉴">
              {TABS.map((item) => (
                <button key={item.id} aria-current={tab === item.id ? 'page' : undefined} onClick={() => setTab(item.id)}>
                  {item.label}
                </button>
              ))}
            </nav>

            <aside className="mh-panel">
              <StatusPanel settings={settings} onChange={changeSettings} />
            </aside>
          </div>
        </div>
      </div>
    </GaesupWorld>
  );
}

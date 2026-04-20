import React, { useEffect, useState } from 'react';

import {
  SceneFader,
  setDefaultToonMode,
  useAudioStore,
  useCatalogStore,
  useCharacterStore,
  useEventsStore,
  useGameTime,
  useI18nStore,
  useMailStore,
  usePerfStore,
  useQuestStore,
  useTownStore,
  useWalletStore,
  useWeatherStore,
} from '../../../src';
import { LOCALE_LABEL, type LocaleId } from '../../../src/core/i18n/types';
import type { PerfTier } from '../../../src/core/perf/types';
import { getEventRegistry } from '../../../src/core/events/registry/EventRegistry';
import Info from '../info';
import { Teleport } from '../teleport';

const SEASON_COLOR: Record<string, string> = {
  spring: '#ffb6c1',
  summer: '#9bd97a',
  autumn: '#e0a060',
  winter: '#cfe2ff',
};
const WEEKDAY_LABEL: Record<string, string> = {
  sun: '일', mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토',
};
const WEATHER_META: Record<string, { sym: string; label: string; color: string }> = {
  sunny:  { sym: 'O', label: '맑음', color: '#ffd84a' },
  cloudy: { sym: 'c', label: '흐림', color: '#aab2bc' },
  rain:   { sym: 'r', label: '비',   color: '#9ad9ff' },
  snow:   { sym: '*', label: '눈',   color: '#dff0ff' },
  storm:  { sym: '!', label: '폭풍', color: '#7f7fff' },
};

function dispatchKey(k: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
}

function HeaderBar() {
  const t = useGameTime();
  const wallet = useWalletStore((s) => s.bells);
  const weather = useWeatherStore((s) => s.current);
  const events = useEventsStore((s) => s.active);
  const reg = getEventRegistry();

  const wmeta = weather ? WEATHER_META[weather.kind] : null;
  const visibleEvents = events.filter((id) => !id.startsWith('season.'));
  const hh = String(t.hour).padStart(2, '0');
  const mm = String(t.minute).padStart(2, '0');

  return (
    <div className="gp-header">
      <div className="gp-glass gp-pill" style={{ paddingRight: 12 }}>
        <span className="gp-chip-dot" style={{ background: SEASON_COLOR[t.season] ?? '#fff' }} />
        <span style={{ fontWeight: 600 }}>
          Y{t.year}·M{String(t.month).padStart(2, '0')}·D{String(t.day).padStart(2, '0')} ({WEEKDAY_LABEL[t.weekday]})
        </span>
        <span style={{ opacity: 0.85, marginLeft: 6 }}>{hh}:{mm}</span>
      </div>

      {wmeta && (
        <div className="gp-glass gp-pill" title={`${wmeta.label} (intensity ${weather!.intensity.toFixed(1)})`}>
          <span className="gp-chip-dot" style={{ background: wmeta.color }} />
          <span>{wmeta.label}</span>
        </div>
      )}

      {visibleEvents.map((id) => {
        const def = reg.get(id);
        if (!def) return null;
        const fest = def.tags?.some((tag) => tag === 'festival' || tag === 'tourney');
        return (
          <div key={id} className="gp-glass gp-pill">
            <span className="gp-chip-dot" style={{ background: fest ? 'var(--gp-accent)' : 'var(--gp-good)' }} />
            <span>{def.name}</span>
          </div>
        );
      })}

      <div style={{ flex: 1 }} />

      <div className="gp-glass gp-pill" style={{ paddingRight: 12, gap: 8 }}>
        <span style={{ color: 'var(--gp-accent)', fontWeight: 700 }}>{wallet.toLocaleString()}</span>
        <span style={{ color: 'var(--gp-text-dim)' }}>B</span>
      </div>
    </div>
  );
}

function LeftSidebar({ toon, onToggleToon, showInfo, setShowInfo, showTele, setShowTele }: {
  toon: boolean;
  onToggleToon: () => void;
  showInfo: boolean;
  setShowInfo: (v: boolean) => void;
  showTele: boolean;
  setShowTele: (v: boolean) => void;
}) {
  const masterMuted = useAudioStore((s) => s.masterMuted);
  const bgmMuted = useAudioStore((s) => s.bgmMuted);
  const sfxMuted = useAudioStore((s) => s.sfxMuted);
  const toggleMaster = useAudioStore((s) => s.toggleMaster);
  const toggleBgm = useAudioStore((s) => s.toggleBgm);
  const toggleSfx = useAudioStore((s) => s.toggleSfx);

  return (
    <div className="gp-left">
      <div className="gp-glass gp-panel" style={{ width: '100%' }}>
        <div className="gp-panel-title">화면</div>
        <button className={`gp-btn${toon ? ' gp-btn--active' : ''}`} onClick={onToggleToon}>
          <span>Toon Shading</span>
          <span className="gp-key">{toon ? 'ON' : 'OFF'}</span>
        </button>
        <button className={`gp-btn${showInfo ? ' gp-btn--active' : ''}`} onClick={() => setShowInfo(!showInfo)}>
          <span>카메라 / 모드</span>
          <span className="gp-key">I-Panel</span>
        </button>
        <button className={`gp-btn${showTele ? ' gp-btn--active' : ''}`} onClick={() => setShowTele(!showTele)}>
          <span>Teleport</span>
          <span className="gp-key">⤴</span>
        </button>
      </div>

      <div className="gp-glass gp-panel" style={{ width: '100%' }}>
        <div className="gp-panel-title">사운드</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className={`gp-btn${masterMuted ? ' gp-btn--muted' : ''}`} style={{ flex: 1 }} onClick={toggleMaster} title="Master">
            <span>M</span>{masterMuted && <span className="gp-key">OFF</span>}
          </button>
          <button className={`gp-btn${bgmMuted ? ' gp-btn--muted' : ''}`} style={{ flex: 1 }} onClick={toggleBgm} title="BGM">
            <span>BGM</span>{bgmMuted && <span className="gp-key">OFF</span>}
          </button>
          <button className={`gp-btn${sfxMuted ? ' gp-btn--muted' : ''}`} style={{ flex: 1 }} onClick={toggleSfx} title="SFX">
            <span>SFX</span>{sfxMuted && <span className="gp-key">OFF</span>}
          </button>
        </div>
      </div>

      <LocaleAndPerfPanel />
    </div>
  );
}

function LocaleAndPerfPanel() {
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  const tier = usePerfStore((s) => s.profile.tier);
  const setTier = usePerfStore((s) => s.setTier);
  const resetAuto = usePerfStore((s) => s.resetAuto);

  const locales: LocaleId[] = ['ko', 'en', 'ja'];
  const tiers: PerfTier[] = ['low', 'medium', 'high'];

  return (
    <div className="gp-glass gp-panel" style={{ width: '100%' }}>
      <div className="gp-panel-title">언어 / 성능</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {locales.map((l) => (
          <button
            key={l}
            className={`gp-btn${locale === l ? ' gp-btn--active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setLocale(l)}
            title={LOCALE_LABEL[l]}
          >
            <span>{l.toUpperCase()}</span>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {tiers.map((t) => (
          <button
            key={t}
            className={`gp-btn${tier === t ? ' gp-btn--active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setTier(t)}
            title={`Performance: ${t}`}
          >
            <span>{t}</span>
          </button>
        ))}
        <button className="gp-btn" onClick={resetAuto} title="Auto detect">
          <span className="gp-key">A</span>
        </button>
      </div>
    </div>
  );
}

function RightSidebar() {
  const messages = useMailStore((s) => s.messages);
  const quests = useQuestStore((s) => s.state);
  const catalog = useCatalogStore((s) => s.entries);
  const houses = useTownStore((s) => s.houses);
  const residents = useTownStore((s) => s.residents);
  const decorationScore = useTownStore((s) => s.decorationScore);

  const unreadMail = messages.reduce((n, m) => n + (m.read ? 0 : 1), 0);
  const unclaimed = messages.reduce((n, m) => n + (m.claimed === false ? 1 : 0), 0);
  const activeQuests = Object.values(quests).filter((p) => p.status === 'active').length;
  const collected = Object.keys(catalog).length;
  const occupied = Object.values(houses).filter((h) => h.state === 'occupied').length;
  const totalHouses = Object.keys(houses).length;
  const residentCount = Object.keys(residents).length;

  type Action = { id: string; key: string; label: string; badge?: number; badgeKind?: 'cool' | 'warn' | 'good' };
  const actions: Action[] = [
    { id: 'inv',  key: 'i', label: '인벤토리' },
    ...(activeQuests > 0
      ? [{ id: 'que', key: 'j', label: '퀘스트', badge: activeQuests, badgeKind: 'cool' as const }]
      : [{ id: 'que', key: 'j', label: '퀘스트' }]),
    ...(unreadMail > 0
      ? [{ id: 'mail', key: 'm', label: '우편', badge: unreadMail, badgeKind: (unclaimed > 0 ? 'warn' : 'cool') as 'warn' | 'cool' }]
      : [{ id: 'mail', key: 'm', label: '우편' }]),
    ...(collected > 0
      ? [{ id: 'cat', key: 'k', label: '도감', badge: collected, badgeKind: 'good' as const }]
      : [{ id: 'cat', key: 'k', label: '도감' }]),
    { id: 'crf',  key: 'c', label: '제작' },
    { id: 'chr',  key: 'o', label: '캐릭터' },
  ];

  const charName = useCharacterStore((s) => s.appearance.name);
  const equipped = useCharacterStore((s) => s.outfits);
  const equippedCount = Object.values(equipped).filter(Boolean).length;

  return (
    <div className="gp-right">
      <div className="gp-glass gp-panel">
        <div className="gp-panel-title">캐릭터</div>
        <div className="gp-panel-row">
          <span style={{ fontWeight: 600 }}>{charName}</span>
          <span style={{ color: 'var(--gp-text-dim)', fontSize: 11 }}>장착 {equippedCount}/5</span>
        </div>
      </div>

      <div className="gp-glass gp-panel">
        <div className="gp-panel-title">마을</div>
        <div className="gp-panel-row">
          <div className="gp-stat">
            <span className="gp-stat-label">데코 점수</span>
            <span className="gp-stat-value" style={{ color: 'var(--gp-accent)' }}>{decorationScore}</span>
          </div>
          <div className="gp-stat" style={{ alignItems: 'flex-end' }}>
            <span className="gp-stat-label">주민</span>
            <span className="gp-stat-value">{occupied}/{totalHouses}</span>
          </div>
        </div>
        <div className="gp-panel-row">
          <span style={{ color: 'var(--gp-text-dim)', fontSize: 11 }}>등록 인원</span>
          <span style={{ fontWeight: 600 }}>{residentCount}</span>
        </div>
      </div>

      <div className="gp-glass gp-panel">
        <div className="gp-panel-title">메뉴</div>
        <div className="gp-actionrow">
          {actions.map((a) => (
            <button key={a.id} className="gp-btn" onClick={() => dispatchKey(a.key)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="gp-key">{a.key.toUpperCase()}</span>
                <span>{a.label}</span>
              </span>
              {a.badge !== undefined && (
                <span className={`gp-badge${a.badgeKind === 'warn' ? ' gp-badge--warn' : a.badgeKind === 'good' ? ' gp-badge--good' : ''}`}>
                  {a.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FooterBar() {
  return (
    <div className="gp-footer">
      <div />
      <div />
      <div className="gp-glass gp-pill" style={{ padding: '6px 12px', alignSelf: 'end' }}>
        <span className="gp-key">F</span><span>도구</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span className="gp-key">E</span><span>대화</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span className="gp-key">T</span><span>말풍선</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span className="gp-key">O</span><span>캐릭터</span>
      </div>
    </div>
  );
}

export type HudShellProps = {
  toonInitial?: boolean;
  toonStorageKey?: string;
};

export function HudShell({ toonInitial = true, toonStorageKey = 'gaesup:toonMode' }: HudShellProps) {
  const [toon, setToon] = useState(toonInitial);
  const [showInfo, setShowInfo] = useState(false);
  const [showTele, setShowTele] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const v = window.localStorage.getItem(toonStorageKey);
    if (v !== null) setToon(v === '1');
  }, [toonStorageKey]);

  const onToggleToon = () => {
    const next = !toon;
    setToon(next);
    setDefaultToonMode(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(toonStorageKey, next ? '1' : '0');
      window.location.reload();
    }
  };

  return (
    <>
      <div className="gp-shell">
        <HeaderBar />
        <LeftSidebar
          toon={toon}
          onToggleToon={onToggleToon}
          showInfo={showInfo}
          setShowInfo={setShowInfo}
          showTele={showTele}
          setShowTele={setShowTele}
        />
        <RightSidebar />
        <FooterBar />
      </div>
      {showInfo && <Info />}
      {showTele && <Teleport />}
      <SceneFader />
    </>
  );
}

export default HudShell;

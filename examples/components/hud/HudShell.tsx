import React, { lazy, Suspense, useState } from 'react';

import {
  LOCALE_LABEL,
  SceneFader,
  useBuildingStore,
  useCatalogStore,
  useLocale,
  useMailStore,
  useQuestStore,
  type LocaleId,
} from 'gaesup-world';

import { createHudActionButtons } from './ActionBar';
import Info from '../info';
import { Teleport } from '../teleport';

const PerformancePanel = lazy(() =>
  import('gaesup-world/editor').then((module) => ({ default: module.PerformancePanel })),
);

function dispatchKey(k: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keyup', { key: k, bubbles: true }));
}

function HeaderBar() {
  return (
    <div className="gp-header">
      <div style={{ flex: 1 }} />
    </div>
  );
}

function LeftSidebar({
  showInfo,
  setShowInfo,
  showTele,
  setShowTele,
  showEnvironmentControls,
  compact,
}: {
  showInfo: boolean;
  setShowInfo: (v: boolean) => void;
  showTele: boolean;
  setShowTele: (v: boolean) => void;
  showEnvironmentControls: boolean;
  compact: boolean;
}) {
  const showSnow = useBuildingStore((s) => s.showSnow);
  const setShowSnow = useBuildingStore((s) => s.setShowSnow);
  const showFog = useBuildingStore((s) => s.showFog);
  const setShowFog = useBuildingStore((s) => s.setShowFog);
  const [showWorldTools, setShowWorldTools] = useState(!compact);
  const [showQuickTools, setShowQuickTools] = useState(!compact);

  return (
    <div className="gp-left">
      <div className="gp-glass gp-panel" style={{ width: '100%' }}>
        <div className="gp-panel-title">빠른 도구</div>
        <button className="gp-btn" onClick={() => setShowQuickTools((open) => !open)}>
          <span>{showQuickTools ? '도구 접기' : '도구 펼치기'}</span>
          <span className="gp-key">{showQuickTools ? 'ON' : 'OFF'}</span>
        </button>
        {showQuickTools && (
          <div className="gp-actionrow">
            <button className={`gp-btn${showInfo ? ' gp-btn--active' : ''}`} onClick={() => setShowInfo(!showInfo)}>
              <span>정보 패널</span>
              <span className="gp-key">{showInfo ? 'ON' : 'OFF'}</span>
            </button>
            <button className={`gp-btn${showTele ? ' gp-btn--active' : ''}`} onClick={() => setShowTele(!showTele)}>
              <span>텔레포트</span>
              <span className="gp-key">{showTele ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        )}
      </div>
      {showEnvironmentControls && (
        <div className="gp-glass gp-panel" style={{ width: '100%' }}>
          <div className="gp-panel-title">월드 환경</div>
          <button className="gp-btn" onClick={() => setShowWorldTools((open) => !open)}>
            <span>{showWorldTools ? '환경 접기' : '환경 펼치기'}</span>
            <span className="gp-key">{showWorldTools ? 'ON' : 'OFF'}</span>
          </button>
          {showWorldTools && (
            <div className="gp-actionrow">
              <button className={`gp-btn${showSnow ? ' gp-btn--active' : ''}`} onClick={() => setShowSnow(!showSnow)}>
                <span>월드 눈</span>
                <span className="gp-key">{showSnow ? 'ON' : 'OFF'}</span>
              </button>
              <button className={`gp-btn${showFog ? ' gp-btn--active' : ''}`} onClick={() => setShowFog(!showFog)}>
                <span>장면 안개</span>
                <span className="gp-key">{showFog ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RightSidebar({ compact }: { compact: boolean }) {
  const messages = useMailStore((s) => s.messages);
  const quests = useQuestStore((s) => s.state);
  const catalog = useCatalogStore((s) => s.entries);
  const { locale, setLocale } = useLocale();

  const unreadMail = messages.reduce((n, m) => n + (m.read ? 0 : 1), 0);
  const unclaimed = messages.reduce((n, m) => n + (m.claimed === false ? 1 : 0), 0);
  const activeQuests = Object.values(quests).filter((p) => p.status === 'active').length;
  const collected = Object.keys(catalog).length;

  type Action = {
    id: string;
    key: string;
    label: string;
    badge?: number;
    badgeKind?: 'cool' | 'warn' | 'good';
    onClick?: () => void;
  };
  const coreActions = createHudActionButtons({
    activeQuests,
    unreadMail,
    unclaimedMail: unclaimed,
    collected,
  });
  const actions: Action[] = [
    ...coreActions.map((action): Action => ({
      id: action.key,
      key: action.key,
      label: action.label,
      ...(typeof action.badge === 'number' ? { badge: action.badge } : {}),
      ...(action.key === 'j' ? { badgeKind: 'cool' as const } : {}),
      ...(action.key === 'm' ? { badgeKind: (unclaimed > 0 ? 'warn' : 'cool') as 'warn' | 'cool' } : {}),
      ...(action.key === 'k' ? { badgeKind: 'good' as const } : {}),
    })),
    { id: 'chr', key: 'o', label: '캐릭터' },
  ];
  const localeOptions: LocaleId[] = ['ko', 'en', 'ja'];

  return (
    <div className="gp-right">
      <div className="gp-glass gp-panel gp-performance-panel">
        <div className="gp-panel-title">성능</div>
        <Suspense fallback={<div className="gp-panel-row">성능 패널 준비 중</div>}>
          <PerformancePanel />
        </Suspense>
      </div>

      <div className="gp-glass gp-panel">
        <div className="gp-panel-title">{compact ? '기능' : '실행 기능'}</div>
        <div className="gp-actionrow">
          {actions.map((a) => (
            <button key={a.id} className="gp-btn" onClick={a.onClick ?? (() => dispatchKey(a.key))}>
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

      <div className="gp-glass gp-panel">
        <div className="gp-panel-title">언어</div>
        <div className="gp-locale-row">
          {localeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`gp-locale-button${locale === option ? ' gp-locale-button--active' : ''}`}
              onClick={() => setLocale(option)}
            >
              {LOCALE_LABEL[option]}
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
      <div className="gp-glass gp-pill gp-footer-help">
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
  showEnvironmentControls?: boolean;
  compact?: boolean;
};

export function HudShell({
  showEnvironmentControls = true,
  compact = false,
}: HudShellProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [showTele, setShowTele] = useState(false);

  return (
    <>
      <div className="gp-shell">
        <HeaderBar />
        <LeftSidebar
          showInfo={showInfo}
          setShowInfo={setShowInfo}
          showTele={showTele}
          setShowTele={setShowTele}
          showEnvironmentControls={showEnvironmentControls}
          compact={compact}
        />
        <RightSidebar compact={compact} />
        {!compact && <FooterBar />}
      </div>
      {showInfo && <Info />}
      {showTele && <Teleport />}
      <SceneFader />
    </>
  );
}

export default HudShell;

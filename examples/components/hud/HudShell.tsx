import React, { useState } from 'react';

import {
  SceneFader,
  useCatalogStore,
  useCharacterStore,
  useMailStore,
  useQuestStore,
  useTownStore,
  useWalletStore,
} from '../../../src';
import Info from '../info';
import { Teleport } from '../teleport';

function dispatchKey(k: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
}

function HeaderBar() {
  const wallet = useWalletStore((s) => s.bells);

  return (
    <div className="gp-header">
      <div style={{ flex: 1 }} />

      <div className="gp-glass gp-pill" style={{ paddingRight: 12, gap: 8 }}>
        <span style={{ color: 'var(--gp-accent)', fontWeight: 600 }}>{wallet.toLocaleString()}</span>
        <span style={{ color: 'var(--gp-text-dim)' }}>B</span>
      </div>
    </div>
  );
}

function LeftSidebar({ showInfo, setShowInfo, showTele, setShowTele }: {
  showInfo: boolean;
  setShowInfo: (v: boolean) => void;
  showTele: boolean;
  setShowTele: (v: boolean) => void;
}) {
  return (
    <div className="gp-left">
      <div className="gp-glass gp-panel" style={{ width: '100%' }}>
        <div className="gp-panel-title">도구</div>
        <button className={`gp-btn${showInfo ? ' gp-btn--active' : ''}`} onClick={() => setShowInfo(!showInfo)}>
          <span>카메라 / 모드</span>
          <span className="gp-key">I-Panel</span>
        </button>
        <button className={`gp-btn${showTele ? ' gp-btn--active' : ''}`} onClick={() => setShowTele(!showTele)}>
          <span>Teleport</span>
          <span className="gp-key">⤴</span>
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
          <span style={{ fontWeight: 500 }}>{charName}</span>
          <span style={{ color: 'var(--gp-text-dim)', fontSize: 12.5 }}>장착 {equippedCount}/5</span>
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
          <span style={{ color: 'var(--gp-text-dim)', fontSize: 12.5 }}>등록 인원</span>
          <span style={{ fontWeight: 500 }}>{residentCount}</span>
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

export type HudShellProps = Record<string, never>;

export function HudShell() {
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

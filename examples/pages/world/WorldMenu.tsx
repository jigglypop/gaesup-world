import { useEffect, useState } from 'react';

import { notify, useCharacterStore, type GaesupRuntime } from 'gaesup-world';

import { WORLD_AVATARS, WORLD_EQUIPMENT, resolveWorldAvatar } from './assets';
import './world-menu.css';

export function WorldMenu({ runtime, ready }: { runtime: GaesupRuntime; ready: boolean }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const name = useCharacterStore((state) => state.appearance.name);
  const outfits = useCharacterStore((state) => state.outfits);
  const equip = useCharacterStore((state) => state.equipOutfit);
  const setName = useCharacterStore((state) => state.setName);
  const avatar = resolveWorldAvatar(outfits.top);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && (event.target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName))) return;
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.key.toLowerCase() === 'c') setOpen((value) => !value);
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);
  const handleSave = async () => {
    setSaving(true);
    try {
      await runtime.save.save();
      notify('success', '캐릭터와 공간을 저장했습니다.');
    } catch {
      notify('error', '저장하지 못했습니다. 저장 진단을 확인해 주세요.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="social-world-ui">
      <section className="social-world-card" aria-label="내 공간">
        <span className="social-world-eyebrow">MY LITTLE WORLD</span>
        <h1>{name}의 작은 숲</h1>
        <p>산책하고, 캐릭터를 바꾸고, 공간을 꾸며요.</p>
        <div className="social-world-actions">
          <button type="button" aria-expanded={open} aria-controls="world-wardrobe" onClick={() => setOpen((value) => !value)}>내 캐릭터 <kbd>C</kbd></button>
          <button type="button" disabled={!ready || saving} onClick={() => { void handleSave(); }}>{saving ? '저장 중…' : '저장'}</button>
        </div>
      </section>
      {open && (
        <section id="world-wardrobe" className="social-world-card social-world-wardrobe" aria-label="캐릭터와 장비">
          <header><h2>내 캐릭터</h2><button type="button" aria-label="캐릭터 패널 닫기" onClick={() => setOpen(false)}>×</button></header>
          <label>이름<input value={name} maxLength={16} onChange={(event) => setName(event.target.value)} /></label>
          <h3>캐릭터 프리셋</h3>
          <div className="social-world-options">
            {WORLD_AVATARS.map((item) => <button key={item.id} type="button" aria-pressed={avatar.id === item.id} onClick={() => equip('top', item.id)}>{item.name}</button>)}
          </div>
          <h3>손에 들기</h3>
          <div className="social-world-options">
            <button type="button" aria-pressed={!outfits.weapon} onClick={() => equip('weapon', null)}>빈손</button>
            {WORLD_EQUIPMENT.map((item) => <button key={item.id} type="button" aria-pressed={outfits.weapon === item.id} onClick={() => equip('weapon', item.id)}>{item.name}</button>)}
          </div>
          <p className="social-world-note">프리셋은 캐릭터 전체를 바꿉니다. 내 의상 제작은 상단 에셋 제작에서 시작하세요.</p>
          <small>KayKit · CC0 · <a href="gltf/kaykit/manifest.json" target="_blank" rel="noreferrer">에셋 출처</a></small>
        </section>
      )}
      <p className="social-world-controls">WASD 이동 · Space 점프 · 우클릭 드래그 회전 · 휠 확대/축소 · C 캐릭터 <span>공간 편집은 상단 편집기</span></p>
    </div>
  );
}

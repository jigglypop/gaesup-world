import { useEffect, useState } from 'react';

import { createAudioEngine, type BgmTrack } from 'gaesup-world';

import type { RoomSettings, RoomSound } from './roomTypes';

const TRACKS: Record<RoomSound, BgmTrack> = {
  calm: { id: 'miniroom-calm', baseFreq: 196, intervalMs: 900, pattern: [0, 7, 12, 7, 4, 7, 11, 7], volume: 0.5 },
  bright: { id: 'miniroom-bright', baseFreq: 261.63, intervalMs: 450, pattern: [0, 4, 7, 12, 7, 4, 2, 7], volume: 0.4 },
};

export function RoomAudio({ settings, onChange }: { settings: RoomSettings; onChange: (patch: Partial<RoomSettings>) => void }) {
  const [engine] = useState(createAudioEngine);
  const [playing, setPlaying] = useState(false);
  const [state, setState] = useState('uninitialized');
  const [error, setError] = useState('');
  useEffect(() => () => { void engine.dispose(); }, [engine]);
  useEffect(() => { engine.setMasterVolume(settings.volume); }, [engine, settings.volume]);
  useEffect(() => {
    function sync() {
      engine.stopBgm();
      if (document.hidden) engine.suspendPlayback();
      else { engine.resumePlayback(); if (playing) { engine.resume(); engine.playBgm(TRACKS[settings.sound]); } }
      setState(engine.getDiagnostics().contextState);
    }
    sync(); document.addEventListener('visibilitychange', sync);
    const timer = playing ? window.setInterval(() => setState(engine.getDiagnostics().contextState), 250) : undefined;
    return () => { document.removeEventListener('visibilitychange', sync); if (timer !== undefined) clearInterval(timer); engine.stopBgm(); };
  }, [engine, playing, settings.sound]);
  function enable() {
    engine.resumePlayback();
    if (!engine.ensure()) { setError('이 브라우저에서 소리를 재생할 수 없습니다.'); return false; }
    engine.resume(); setError(''); return true;
  }
  return <div className="room-view-controls" aria-label="미니룸 소리 설정" data-audio-state={state}>
    <label>배경음<select aria-label="미니룸 배경음" value={settings.sound} onChange={event => onChange({ sound: event.target.value as RoomSound })}><option value="calm">잔잔하게</option><option value="bright">경쾌하게</option></select></label>
    <button aria-pressed={playing} onClick={() => { if (playing) setPlaying(false); else if (enable()) setPlaying(true); }}>{playing ? '배경음 정지' : '배경음 재생'}</button>
    <label>볼륨<input aria-label="미니룸 볼륨" type="range" min="0" max="1" step="0.05" value={settings.volume} onChange={event => onChange({ volume: Number(event.target.value) })} /></label>
    <button onClick={() => { if (enable()) engine.playSfx({ id: 'miniroom-preview', freq: 660, duration: 0.14, volume: 0.4 }); }}>효과음 듣기</button>
    {playing && state === 'suspended' && <button onClick={() => enable()}>소리 재개</button>}
    {error && <span role="alert">{error}</span>}
  </div>;
}

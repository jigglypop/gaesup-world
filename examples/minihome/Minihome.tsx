import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { exportUnityScene } from 'gaesup-world';

import { jsonEqual, loadMinihome, makeFurniture, MAX_FURNITURE, parseMinihome, saveMinihome } from './model';
import { RoomEditorPanel } from './RoomEditorPanel';
import { RoomSocial } from './RoomSocial';
import { useRoomVisitors } from './roomVisitors';
import { adoptSharedMinihome, createMinihomeSession } from './session';
import { createShareLink, downloadJson, isShareLink, readShareLink } from './sharing';
import { DEFAULT_EDITOR, expandTerrain, paintTiles, sculptTerrain, terrainHeight, type RoomEditor } from './terrain';
import { FURNITURE } from './types';
import type { FurnitureKind, HomeNote, HomeTab, MinihomeData } from './types';
import './world.css';

const Miniroom = lazy(() => import('./Miniroom'));

function MiniAvatar() {
  return (
    <svg viewBox="0 0 160 160" role="img" aria-label="코랄 스커트를 입은 나의 미니미">
      <circle cx="80" cy="78" r="68" fill="#f9edd5" />
      <path d="M15 133Q80 113 145 133" fill="#d5e1cd" />
      <ellipse cx="82" cy="139" rx="27" ry="5" fill="#bed0b7" />
      <path d="M52 68Q47 31 80 30Q113 28 111 77L101 92H59Z" fill="#694c43" />
      <rect x="63" y="101" width="13" height="34" rx="6" fill="#f0c6a4" />
      <rect x="85" y="101" width="13" height="34" rx="6" fill="#f0c6a4" />
      <path d="M60 108L64 78H97L104 108Z" fill="#faf0d9" />
      <path d="M65 99L58 118H105L97 99Z" fill="#cf8e76" />
      <rect x="53" y="80" width="12" height="28" rx="6" fill="#faf0d9" />
      <rect x="98" y="80" width="12" height="28" rx="6" fill="#faf0d9" />
      <ellipse cx="81" cy="64" rx="27" ry="27" fill="#f2c9a8" />
      <path d="M53 55Q54 27 82 30Q108 28 108 55L92 45L80 54L69 43Z" fill="#694c43" />
      <circle cx="71" cy="65" r="2.5" fill="#634b43" />
      <circle cx="92" cy="65" r="2.5" fill="#634b43" />
      <path d="M78 76Q82 79 86 75" fill="none" stroke="#b57968" strokeWidth="2" />
      <ellipse cx="63" cy="74" rx="5" ry="3" fill="#eab29a" />
      <ellipse cx="100" cy="74" rx="5" ry="3" fill="#eab29a" />
      <rect x="60" y="131" width="19" height="8" rx="4" fill="#78584b" />
      <rect x="83" y="131" width="19" height="8" rx="4" fill="#78584b" />
    </svg>
  );
}

/** A shared-space link decodes asynchronously before the home opens, so the session starts from the shared copy. */
export default function Minihome() {
  const [shared, setShared] = useState<MinihomeData | null | undefined>(() => isShareLink(location.hash) ? undefined : null);
  useEffect(() => {
    if (shared !== undefined) return;
    let active = true;
    void readShareLink(location.hash).then((home) => { if (active) setShared(home); });
    return () => { active = false; };
  }, [shared]);
  return shared === undefined ? <div className="room-placeholder">공유된 공간을 여는 중…</div> : <Home shared={shared} />;
}

function Home({ shared }: { shared: MinihomeData | null }) {
  const [initial] = useState(loadMinihome);
  const [session, setSession] = useState(() => createMinihomeSession(shared ?? initial.data));
  const { data, canUndo, canRedo } = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const { controller, update: setData } = session;
  const visitors = useRoomVisitors(data, setData);
  const remotePeers = useMemo(() => visitors.connection.peers.filter(peer => peer.id !== visitors.connection.id), [visitors.connection.peers, visitors.connection.id]);
  const document = data.room;
  const [preview, setPreview] = useState(!!shared);
  const [autoSave, setAutoSave] = useState(initial.autoSave && !shared);
  const storageBase = useRef(initial.raw);
  const [tab, setTab] = useState<HomeTab>('home');
  const [editing, setEditing] = useState(() => new URLSearchParams(location.search).get('edit') === '1');
  const [editor, setEditor] = useState<RoomEditor>({ ...DEFAULT_EDITOR });
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [profileOpen, setProfileOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [status, setStatus] = useState(initial.warning);
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(initial.data);
  const [saveError, setSaveError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const view = useMemo(
    () => ({ editing, selected, zoom, theme: data.theme, terrain: data.terrain, editor }),
    [editing, selected, zoom, data.theme, data.terrain, editor],
  );
  const object = document.objects.find((entry) => entry.id === selected);
  // Compared structurally, so an edit does not serialize the whole home.
  const dirty = useMemo(() => !jsonEqual(data, saved), [data, saved]);
  const save = useCallback(() => {
    if (preview || visitors.visiting) return;
    try {
      const raw = JSON.stringify(data);
      saveMinihome(raw, storageBase.current);
      storageBase.current = raw;
      setSaved(data);
      setSaveError('');
      setAutoSave(true);
      setStatus('미니홈피를 이 브라우저에 저장했어요.');
    } catch (error) {
      setAutoSave(false);
      setSaveError(`저장하지 못했어요. ${error instanceof Error ? error.message : '브라우저 저장 공간과 권한을 확인해주세요.'}`);
    }
  }, [data, preview, visitors.visiting]);
  useEffect(() => {
    if (!dirty || !autoSave || preview || visitors.visiting) return;
    const timer = setTimeout(save, 1200);
    return () => clearTimeout(timer);
  }, [dirty, autoSave, preview, save, visitors.visiting]);
  useEffect(() => {
    if (!dirty || preview || visitors.visiting) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, preview, visitors.visiting]);
  useEffect(() => { if (visitors.isGuest) { setEditing(false); setSelected(null); } }, [visitors.isGuest]);
  useEffect(() => {
    if (selected && !document.objects.some((item) => item.id === selected)) setSelected(null);
  }, [document, selected]);
  async function importFile(file: File) {
    try {
      if (file.size > 512_000) throw new Error('백업 파일은 512 KB 이하여야 합니다.');
      const imported = parseMinihome(await file.text());
      if (!imported) throw new Error('지원하는 미니홈피 백업 파일이 아닙니다.');
      setData(imported);
      setSelected(null);
      setStatus('백업을 가져왔어요. 실행 취소로 이전 상태로 돌아갈 수 있어요.');
    } catch (error) { setStatus(error instanceof Error ? error.message : '파일을 읽지 못했습니다.'); }
  }
  function addFurniture(kind: FurnitureKind, x: number, z: number) {
    if (document.objects.length >= MAX_FURNITURE) {
      setStatus(`가구는 최대 ${MAX_FURNITURE}개까지 놓을 수 있습니다.`);
      return;
    }
    const base = makeFurniture(kind, x, z);
    const item = { ...base, transform: { ...base.transform, position: [x, terrainHeight(data.terrain, x, z), z] as [number, number, number] } };
    const result = controller.dispatch({ type: 'scene-object.create', object: item });
    if (result.accepted) {
      setSelected(item.id);
      setStatus(`${FURNITURE[kind].name}을 놓았어요. 저장하면 다음에도 그대로 만날 수 있어요.`);
    }
  }
  function duplicateFurniture() {
    if (!object || document.objects.length >= MAX_FURNITURE) return;
    const id = crypto.randomUUID();
    const item = { ...object, id, name: `${object.name} 복제`, transform: { ...object.transform, position: [Math.min(data.terrain.size / 2 - 0.75, object.transform.position[0] + 0.5), 0, Math.min(data.terrain.size / 2 - 0.75, object.transform.position[2] + 0.5)] as [number, number, number] }, components: object.components.map(component => ({ ...component, id: `${id}-${component.type}` })) };
    const result = controller.dispatch({ type: 'scene-object.create', object: item }); if (result.accepted) setSelected(id);
  }
  function toggleEditing() {
    if (visitors.isGuest) return;
    const next = !editing; setEditing(next); setSelected(null);
    const url = new URL(location.href); if (next) url.searchParams.set('edit', '1'); else url.searchParams.delete('edit');
    history.replaceState(null, '', url);
  }
  useEffect(() => {
    if (!editing) return;
    const key = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.closest('input, textarea, select')) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) session.redo(); else session.undo(); }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [editing, session]);
  function post() {
    const text = message.trim();
    if (!text) return;
    const note: HomeNote = {
      id: crypto.randomUUID(),
      author: tab === 'diary' ? data.profile.name : author.trim() || '다정한 방문자',
      text,
      date: new Date().toISOString(),
    };
    const field = tab === 'diary' ? 'diary' : 'guestbook';
    setData((previous) => ({ ...previous, [field]: [note, ...previous[field]].slice(0, 100) }));
    setMessage('');
    setStatus('글을 남겼어요. 미니홈피 저장을 누르면 이 브라우저에 보관됩니다.');
  }
  return <div className="minihome world-home" data-editing={editing}>
    <header className="world-header">
      <a className="world-brand" href={import.meta.env.BASE_URL}><span>g.</span> GAESUP</a>
      <div className="world-identity"><h1>{data.profile.title}</h1><span>{data.profile.name}의 공간 · {data.terrain.size} × {data.terrain.size}</span></div>
      <div className="world-header-actions">
        <button aria-expanded={profileOpen} onClick={() => setProfileOpen(value => !value)}>프로필</button>
        <button aria-expanded={socialOpen} onClick={() => setSocialOpen(value => !value)}>초대 · {remotePeers.length + 1}</button>
        <details className="world-files"><summary>파일</summary><div className="home-tools" aria-label="백업과 편집 기록">
          <button onClick={session.undo} disabled={!canUndo || visitors.isGuest}>실행 취소</button>
          <button onClick={session.redo} disabled={!canRedo || visitors.isGuest}>다시 실행</button>
          <button onClick={() => downloadJson(data, 'gaesup-home.json')}>파일 백업</button>
          <button onClick={() => downloadJson(exportUnityScene(data.room), 'unity-scene.json')}>Unity 장면 JSON</button>
          <button disabled={visitors.isGuest} onClick={() => fileInput.current?.click()}>백업 가져오기</button>
          <button onClick={() => { void createShareLink(data, location.href).then((link) => { setShareLink(link); setStatus('공유 링크에는 프로필과 공간만 포함됩니다.'); }, (error: unknown) => setStatus(error instanceof Error ? error.message : '공유 링크를 만들지 못했습니다.')); }}>공간 사본 공유</button>
          <a href={`${import.meta.env.BASE_URL}engine`}>엔진 실험실 ↗</a>
        </div></details>
        <button className="world-save" aria-label="미니홈피 저장" disabled={preview || visitors.visiting} onClick={save}>{dirty && <i />}저장</button>
      </div>
    </header>
    <input ref={fileInput} type="file" accept=".json,application/json" hidden aria-label="미니홈피 백업 파일" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void importFile(file); }} />
    <main className="world-stage" aria-label="내 공간">
      <Suspense fallback={<div className="room-placeholder">공간을 준비하고 있습니다…</div>}>
        <Miniroom controller={controller} view={view} onSelect={setSelected} settings={data.roomSettings} peers={remotePeers}
          onPaint={(indices, kind) => setData(previous => ({ ...previous, terrain: paintTiles(previous.terrain, indices, kind) }))}
          onSculpt={(indices, shape) => setData(previous => {
            const terrain = sculptTerrain(previous.terrain, indices, shape);
            const room = { ...previous.room, objects: previous.room.objects.map(object => {
              const [x, , z] = object.transform.position;
              return { ...object, transform: { ...object.transform, position: [x, terrainHeight(terrain, x, z), z] as [number, number, number] } };
            }) };
            return { ...previous, terrain, room };
          })}
          onPlace={addFurniture} onZoom={setZoom} onSettingsChange={patch => setData(previous => ({ ...previous, roomSettings: { ...previous.roomSettings, ...patch } }))} />
      </Suspense>
      {editing && <RoomEditorPanel editor={editor} onChange={setEditor} objects={document.objects} selected={selected} onSelect={setSelected} controller={controller}
        undo={session.undo} redo={session.redo} canUndo={canUndo} canRedo={canRedo} onDuplicate={duplicateFurniture} theme={data.theme} onTheme={theme => setData(previous => ({ ...previous, theme }))}
        terrain={data.terrain} onExpand={() => { setData(previous => ({ ...previous, terrain: expandTerrain(previous.terrain) })); setStatus('땅을 넓혔습니다. 새 타일에도 가구를 놓을 수 있습니다.'); }} />}
      {profileOpen && <section className="world-panel profile-panel" aria-label="프로필 편집">
        <div className="panel-heading"><h2>프로필</h2><button aria-label="프로필 닫기" onClick={() => setProfileOpen(false)}>×</button></div>
        <div className="profile-preview"><MiniAvatar /><strong>{data.profile.name}</strong></div>
        <form className="profile-form" onSubmit={event => { event.preventDefault(); setProfileOpen(false); }}>
          <label>이름<input aria-label="프로필 이름" maxLength={16} value={data.profile.name} onChange={event => setData(previous => ({ ...previous, profile: { ...previous.profile, name: event.target.value } }))} /></label>
          <label>공간 이름<input aria-label="홈피 제목" maxLength={40} value={data.profile.title} onChange={event => setData(previous => ({ ...previous, profile: { ...previous.profile, title: event.target.value } }))} /></label>
          <label>소개<textarea aria-label="프로필 소개" maxLength={150} value={data.profile.bio} onChange={event => setData(previous => ({ ...previous, profile: { ...previous.profile, bio: event.target.value } }))} /></label>
          <label>기분<select value={data.profile.mood} onChange={event => setData(previous => ({ ...previous, profile: { ...previous.profile, mood: event.target.value } }))}>{['소소한 행복', '느긋한 하루', '두근두근', '쉬어가는 중'].map(mood => <option key={mood}>{mood}</option>)}</select></label>
          <button className="primary-button" type="submit">완료</button>
        </form>
      </section>}
      {socialOpen && <div className="world-panel social-panel"><div className="panel-heading"><h2>함께하기</h2><button aria-label="함께하기 닫기" onClick={() => setSocialOpen(false)}>×</button></div>
        <RoomSocial connection={visitors.connection} name={data.profile.name} onJoin={visitors.join} onLeave={visitors.leave} onChat={visitors.chat} />
      </div>}
      {tab !== 'home' && <section className="world-panel notes-page" aria-label={tab === 'diary' ? '기록' : '방명록'}>
        <div className="panel-heading"><h2>{tab === 'diary' ? '기록' : '방명록'}</h2><button aria-label="기록 닫기" onClick={() => setTab('home')}>×</button></div>
        <form className="note-form" onSubmit={event => { event.preventDefault(); if (!preview) post(); }}>
          {tab === 'guestbook' && <input aria-label="방명록 닉네임" placeholder="이름 또는 닉네임" maxLength={20} value={author} disabled={preview} onChange={event => setAuthor(event.target.value)} />}
          <textarea aria-label={tab === 'diary' ? '다이어리 내용' : '방명록 내용'} placeholder={tab === 'diary' ? '오늘의 기록' : '인사를 남겨주세요'} value={message} disabled={preview} onChange={event => setMessage(event.target.value)} maxLength={1000} required />
          <div><small>{preview ? '내 공간으로 가져온 뒤 작성할 수 있습니다.' : `${message.length} / 1,000`}</small><button type="submit" className="primary-button" disabled={preview}>남기기</button></div>
        </form>
        <div className="note-list">{data[tab].length ? data[tab].map(note => <article key={note.id}><header><b>{note.author}</b><time>{new Date(note.date).toLocaleDateString('ko-KR')}</time></header><p>{note.text}</p></article>) : <p className="notes-empty">아직 글이 없습니다.</p>}</div>
      </section>}
      {shareLink && <div className="world-panel share-panel"><div className="panel-heading"><h2>공간 사본 공유</h2><button aria-label="공유 닫기" onClick={() => setShareLink('')}>×</button></div><label>프로필과 공간의 사본<input aria-label="방 공유 링크" readOnly value={shareLink} onFocus={event => event.target.select()} /></label></div>}
      {preview && <div className="share-preview" role="status">공유된 공간의 사본입니다.
        <button onClick={() => { setSession(adoptSharedMinihome(initial.data, data)); setSelected(null); setPreview(false); setAutoSave(false); history.replaceState(null, '', location.pathname); setStatus('기존 기록은 유지됩니다. 가져온 공간을 확인한 뒤 저장해 주세요.'); }}>내 공간으로 가져오기</button><a href={import.meta.env.BASE_URL}>돌아가기</a>
      </div>}
      <nav className="world-dock" aria-label="공간 메뉴">
        <button aria-current={tab === 'home' && !editing ? 'page' : undefined} onClick={() => { setTab('home'); if (editing) toggleEditing(); }}>⌂ <span>둘러보기</span></button>
        <button aria-pressed={editing} disabled={visitors.isGuest} onClick={toggleEditing}>▦ <span>{editing ? '꾸미기 완료' : '공간 꾸미기'}</span></button>
        <span className="dock-divider" />
        <button aria-current={tab === 'diary' ? 'page' : undefined} onClick={() => { setTab(tab === 'diary' ? 'home' : 'diary'); setMessage(''); }}>✎ <span>기록</span></button>
        <button aria-current={tab === 'guestbook' ? 'page' : undefined} onClick={() => { setTab(tab === 'guestbook' ? 'home' : 'guestbook'); setMessage(''); }}>☷ <span>방명록</span></button>
        <span className="dock-divider" />
        <button aria-label="미니룸 축소" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>−</button><button aria-label="미니룸 확대" onClick={() => setZoom(Math.min(4, zoom + 0.25))}>＋</button>
      </nav>
    </main>
    <footer className="world-status"><span className="connection-state"><i />{visitors.connection.status === 'online' ? `${remotePeers.length + 1}명 함께하는 중` : '내 공간'}</span><span role="status">{visitors.visiting ? '방문 중 · 나가면 내 공간으로 돌아갑니다.' : saveError || status || (dirty ? '저장하지 않은 변경 있음' : '이 브라우저에 저장됨')}</span><a href={`${import.meta.env.BASE_URL}performance`}>성능</a></footer>
  </div>;
}

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { exportUnityScene } from 'gaesup-world';

import { loadMinihome, makeFurniture, MAX_FURNITURE, parseMinihome, saveMinihome } from './model';
import { RoomEditorPanel } from './RoomEditorPanel';
import { RoomSocial } from './RoomSocial';
import { useRoomVisitors } from './roomVisitors';
import { adoptSharedMinihome, createMinihomeSession } from './session';
import { createShareLink, downloadJson, readShareLink } from './sharing';
import { DEFAULT_EDITOR, paintTiles, type RoomEditor } from './terrain';
import { FURNITURE } from './types';
import type { FurnitureKind, HomeNote, HomeTab } from './types';
import './styles.css';

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

export default function Minihome() {
  const [initial] = useState(loadMinihome);
  const [shared] = useState(() => readShareLink(location.hash));
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
  const [status, setStatus] = useState(initial.warning);
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [savedState, setSavedState] = useState(() => JSON.stringify(initial.data));
  const [saveError, setSaveError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const view = useMemo(
    () => ({ editing, selected, zoom, theme: data.theme, terrain: data.terrain, editor }),
    [editing, selected, zoom, data.theme, data.terrain, editor],
  );
  const object = document.objects.find((entry) => entry.id === selected);
  const raw = useMemo(() => JSON.stringify(data), [data]);
  const dirty = raw !== savedState;
  const save = useCallback(() => {
    if (preview || visitors.visiting) return;
    try {
      saveMinihome(raw, storageBase.current);
      storageBase.current = raw;
      setSavedState(raw);
      setSaveError('');
      setAutoSave(true);
      setStatus('미니홈피를 이 브라우저에 저장했어요.');
    } catch (error) {
      setAutoSave(false);
      setSaveError(`저장하지 못했어요. ${error instanceof Error ? error.message : '브라우저 저장 공간과 권한을 확인해주세요.'}`);
    }
  }, [raw, preview, visitors.visiting]);
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
    const item = makeFurniture(kind, x, z);
    const result = controller.dispatch({ type: 'scene-object.create', object: item });
    if (result.accepted) {
      setSelected(item.id);
      setStatus(`${FURNITURE[kind].name}을 놓았어요. 저장하면 다음에도 그대로 만날 수 있어요.`);
    }
  }
  function duplicateFurniture() {
    if (!object || document.objects.length >= MAX_FURNITURE) return;
    const id = crypto.randomUUID();
    const item = { ...object, id, name: `${object.name} 복제`, transform: { ...object.transform, position: [Math.min(11.25, object.transform.position[0] + 0.5), 0, Math.min(11.25, object.transform.position[2] + 0.5)] as [number, number, number] }, components: object.components.map(component => ({ ...component, id: `${id}-${component.type}` })) };
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
  return (
    <div className={`minihome town-home${editing ? ' town-editing' : ''}${profileOpen ? ' profile-open' : ''}`}>
      <header className="home-header">
        <a href={import.meta.env.BASE_URL} className="home-brand">
          <span>m</span>mini<span className="brand-dot">.</span>home<small>by gaesup world</small>
        </a>
        <div className="header-note">마음을 담은 작은 공간, 우리만의 미니홈피</div>
        <button className="profile-toggle" aria-expanded={profileOpen} onClick={() => setProfileOpen(value => !value)}>프로필</button>
        <a href={`${import.meta.env.BASE_URL}engine`} className="engine-link">
          개발자 · 엔진 실험실 ↗
        </a>
      </header>
      <div className="home-intro">
        <span>YOUR OWN LITTLE UNIVERSE</span>
        <p>
          반가워요. 여기는 <b>{data.profile.name}</b>의 미니홈피예요.
        </p>
        <div>⌂ HOME SWEET HOME</div>
      </div>
      <main className="home-book">
        <div className="book-stitch">
          <div className="book-pages">
            <aside className="profile-page">
              <div className="profile-top">
                <b>MY PROFILE</b>
                <span>일상 수집가</span>
              </div>
              <div className="profile-paper">
                <div className="profile-image">
                  <MiniAvatar />
                  <span className="photo-label">a little moment of me</span>
                </div>
                <div className="mood-line">
                  <span>TODAY IS</span>
                  <b>☀ {data.profile.mood}</b>
                </div>
                <h2>
                  {data.profile.name}
                  <span>✳</span>
                </h2>
                <p className="profile-bio">{data.profile.bio}</p>
                <button className="text-button" onClick={() => setProfileOpen(!profileOpen)}>
                  {profileOpen ? '프로필 접기' : '프로필 수정'} <span>✎</span>
                </button>
                {profileOpen && (
                  <form
                    className="profile-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      setProfileOpen(false);
                    }}
                  >
                    <label>
                      이름
                      <input
                        aria-label="프로필 이름"
                        maxLength={16}
                        value={data.profile.name}
                        onChange={(event) =>
                          setData({
                            ...data,
                            profile: { ...data.profile, name: event.target.value },
                          })
                        }
                      />
                    </label>
                    <label>
                      홈피 제목
                      <input
                        aria-label="홈피 제목"
                        maxLength={40}
                        value={data.profile.title}
                        onChange={(event) =>
                          setData({
                            ...data,
                            profile: { ...data.profile, title: event.target.value },
                          })
                        }
                      />
                    </label>
                    <label>
                      소개
                      <textarea
                        aria-label="프로필 소개"
                        maxLength={150}
                        value={data.profile.bio}
                        onChange={(event) =>
                          setData({
                            ...data,
                            profile: { ...data.profile, bio: event.target.value },
                          })
                        }
                      />
                    </label>
                    <label>
                      오늘의 기분
                      <select
                        value={data.profile.mood}
                        onChange={(event) =>
                          setData({
                            ...data,
                            profile: { ...data.profile, mood: event.target.value },
                          })
                        }
                      >
                        <option>소소한 행복</option>
                        <option>느긋한 하루</option>
                        <option>두근두근</option>
                        <option>쉬어가는 중</option>
                      </select>
                    </label>
                    <button className="small-button" type="submit">
                      수정 완료
                    </button>
                  </form>
                )}
                <div className="profile-bottom">
                  <span>나를 표현하는 작은 취향들</span>
                  <div className="interest-tags">
                    <span># 따뜻한 방</span>
                    <span># 초록 식물</span>
                    <span># 나의 일상</span>
                  </div>
                </div>
              </div>
              <div className="little-note">
                <span>✉</span>
                <p>
                  가끔은 아무것도 안 해도 괜찮아.
                  <br />
                  <b>여기서는 그냥, 나답게.</b>
                </p>
              </div>
            </aside>
            <span className="binder-ring top" />
            <span className="binder-ring bottom" />
            <section className="content-page">
              <div className="homepage-title">
                <h1>
                  {data.profile.title}
                  <span>˚₊·</span>
                </h1>
                <span>MINIHOME / 01</span>
              </div>
              <div className="page-paper">
                <div className="page-heading">
                  <div>
                    <span className="section-kicker">
                      {tab === 'home'
                        ? 'MY MINIROOM'
                        : tab === 'diary'
                          ? 'MY LITTLE DIARY'
                          : 'GUEST BOOK'}
                    </span>
                    <h2>
                      {tab === 'home'
                        ? '나의 3D 타운'
                        : tab === 'diary'
                          ? '평범해서 더 소중한 하루'
                          : '다녀간 마음을 남겨주세요'}
                    </h2>
                  </div>
                  {tab === 'home' && <button className="town-edit-button" disabled={visitors.isGuest} onClick={toggleEditing}>{visitors.isGuest ? '방문 중 · 주인만 편집' : editing ? '편집 완료 · 둘러보기' : '공간 편집'}</button>}
                </div>
                {tab === 'home' && <div className="town-workspace">
                  {editing && <RoomEditorPanel editor={editor} onChange={setEditor} objects={document.objects} selected={selected} onSelect={setSelected} controller={controller} undo={session.undo} redo={session.redo} canUndo={canUndo} canRedo={canRedo} onDuplicate={duplicateFurniture} theme={data.theme} onTheme={theme => setData(previous => ({ ...previous, theme }))} />}
                  <Suspense fallback={<div className="room-placeholder">3D 타운 준비 중…</div>}>
                    <Miniroom controller={controller} view={view} onSelect={setSelected} settings={data.roomSettings}
                      peers={remotePeers}
                      onPaint={(indices, kind) => setData(previous => ({ ...previous, terrain: paintTiles(previous.terrain, indices, kind) }))}
                      onPlace={addFurniture} onZoom={setZoom}
                      onSettingsChange={patch => setData(previous => ({ ...previous, roomSettings: { ...previous.roomSettings, ...patch } }))} />
                  </Suspense>
                </div>}
                {tab === 'home' && <RoomSocial connection={visitors.connection} name={data.profile.name} onJoin={visitors.join} onLeave={visitors.leave} onChat={visitors.chat} />}
                {tab === 'home' ? (
                  <>
                    <div className="room-actions">
                      <p>
                        <span>✿</span> 좋아하는 것들로 채워가는, 나만의 작은 세상.
                      </p>
                      <div>
                        <button
                          className="zoom-button"
                          aria-label="미니룸 축소"
                          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                        >
                          −
                        </button>
                        <button
                          className="zoom-button"
                          aria-label="미니룸 확대"
                          onClick={() => setZoom(Math.min(4, zoom + 0.25))}
                        >
                          ＋
                        </button>
                        <button
                          className={editing ? 'decorate-button active' : 'decorate-button'}
                          disabled={visitors.isGuest}
                          onClick={toggleEditing}
                        >
                          ✎ {editing ? '꾸미기 완료' : '미니룸 꾸미기'}
                        </button>
                      </div>
                    </div>
                    {!editing && (
                      <div className="home-updates">
                        <section>
                          <h3>
                            작은 기록 <span>DIARY</span>
                          </h3>
                          <button
                            onClick={() => {
                              setTab('diary');
                              setMessage('');
                            }}
                          >
                            {data.diary[0]?.text.slice(0, 45) ||
                              '오늘의 기분을 한 줄로 남겨볼까요?'}{' '}
                            <span>→</span>
                          </button>
                        </section>
                        <section>
                          <h3>
                            다정한 인사 <span>GUEST BOOK</span>
                          </h3>
                          <button
                            onClick={() => {
                              setTab('guestbook');
                              setMessage('');
                            }}
                          >
                            {data.guestbook.length
                              ? `${data.guestbook.length}개의 마음이 머물렀어요.`
                              : '첫 번째 인사를 기다리고 있어요.'}
                            <span>→</span>
                          </button>
                        </section>
                      </div>
                    )}
                  </>
                ) : (
                  <section className="notes-page">
                    <p className="notes-description">
                      {tab === 'diary'
                        ? '아무 일 없던 하루도, 나에게는 소중한 기록.'
                        : '짧은 안부 한 마디도 오래 기억될 거예요.'}
                    </p>
                    <form
                      className="note-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (!preview) post();
                      }}
                    >
                      {tab === 'guestbook' && (
                        <input
                          aria-label="방명록 닉네임"
                          placeholder="이름 또는 닉네임"
                          maxLength={20}
                          value={author}
                          disabled={preview}
                          onChange={(event) => setAuthor(event.target.value)}
                        />
                      )}
                      <textarea
                        aria-label={tab === 'diary' ? '다이어리 내용' : '방명록 내용'}
                        placeholder={
                          tab === 'diary'
                            ? '오늘은 어떤 하루였나요?'
                            : '반가워! 네 방 참 포근하다 :)'
                        }
                        value={message}
                        disabled={preview}
                        onChange={(event) => setMessage(event.target.value)}
                        maxLength={1000}
                        required
                      />
                      <div>
                        <small>{preview ? '내 방으로 가져온 뒤 기록할 수 있어요.' : `${message.length} / 1,000`}</small>
                        <button className="decorate-button" type="submit" disabled={preview}>
                          {tab === 'diary' ? '기록 남기기' : '인사 남기기'}
                        </button>
                      </div>
                    </form>
                    <div className="note-list">
                      {data[tab].length === 0 ? (
                        <div className="notes-empty">
                          <span>✉</span>
                          <p>
                            아직은 비어 있는 작은 페이지.
                            <br />첫 번째 이야기를 들려주세요.
                          </p>
                        </div>
                      ) : (
                        data[tab].map((note) => (
                          <article key={note.id}>
                            <header>
                              <b>{note.author}</b>
                              <time>{new Date(note.date).toLocaleDateString('ko-KR')}</time>
                            </header>
                            <p>{note.text}</p>
                          </article>
                        ))
                      )}
                    </div>
                  </section>
                )}
                {preview && <div className="share-preview" role="status">
                  공유된 방의 사본입니다. 내 저장 데이터는 그대로 유지됩니다.
                  <button onClick={() => {
                    setSession(adoptSharedMinihome(initial.data, data));
                    setSelected(null);
                    setPreview(false);
                    setAutoSave(false);
                    history.replaceState(null, '', location.pathname);
                    setStatus('기존 다이어리와 방명록은 유지됩니다. 가져온 방을 확인한 뒤 저장해 주세요.');
                  }}>내 방으로 가져오기</button>
                  <a href={import.meta.env.BASE_URL}>내 방으로 돌아가기</a>
                </div>}
                <div className="home-tools" aria-label="백업과 편집 기록">
                  <button onClick={session.undo} disabled={!canUndo || visitors.isGuest}>실행 취소</button>
                  <button onClick={session.redo} disabled={!canRedo || visitors.isGuest}>다시 실행</button>
                  <button onClick={() => downloadJson(data, 'mini-home.json')}>파일 백업</button>
                  <button onClick={() => downloadJson(exportUnityScene(data.room), 'unity-scene.json')}>Unity 장면 JSON</button>
                  <button disabled={visitors.isGuest} onClick={() => fileInput.current?.click()}>백업 가져오기</button>
                  <input ref={fileInput} type="file" accept=".json,application/json" hidden aria-label="미니홈피 백업 파일" onChange={(event) => {
                    const file = event.target.files?.[0]; event.target.value = ''; if (file) void importFile(file);
                  }} />
                  <button onClick={() => {
                    try { setShareLink(createShareLink(data, location.href)); setStatus('프로필과 방만 공유합니다. 다이어리와 방명록은 포함하지 않습니다.'); }
                    catch (error) { setStatus(error instanceof Error ? error.message : '공유 링크를 만들지 못했습니다.'); }
                  }}>방 공유</button>
                </div>
                {shareLink && <label className="share-link">프로필과 방 공유 링크 · 복사해서 보내세요
                  <input aria-label="방 공유 링크" readOnly value={shareLink} onFocus={(event) => event.target.select()} />
                </label>}
                <div className="page-save">
                  <span role="status">
                    {visitors.visiting ? '방문 중입니다. 내 공간은 나가면 복원됩니다.' : saveError || (dirty ? '아직 저장하지 않은 변경이 있어요. ' : '') || status ||
                      (dirty
                        ? '아직 저장하지 않은 변경이 있어요.'
                        : '이 공간은 현재 브라우저에 보관됩니다.')}
                  </span>
                  <button onClick={save} disabled={preview || visitors.visiting}>미니홈피 저장 {dirty && !visitors.visiting && <i />}</button>
                </div>
              </div>
            </section>
            <nav className="home-tabs" aria-label="미니홈피 메뉴">
              {(
                [
                  { id: 'home', label: '홈', icon: '⌂' },
                  { id: 'diary', label: '다이어리', icon: '▤' },
                  { id: 'guestbook', label: '방명록', icon: '✉' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  aria-current={tab === item.id ? 'page' : undefined}
                  onClick={() => {
                    setTab(item.id);
                    setMessage('');
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </main>
      <footer className="home-footer">
        <span>나의 취향이 모여, 나의 세계가 되는 곳.</span>
        <small>
          프로필·방·글은 이 브라우저에 저장됩니다. 공유 링크는 프로필과 방의 사본을 담으며, 실시간 방문과 계정 동기화는 지원하지 않습니다.
        </small>
        <a href={`${import.meta.env.BASE_URL}engine`}>GAESUP WORLD ↗</a>
      </footer>
    </div>
  );
}

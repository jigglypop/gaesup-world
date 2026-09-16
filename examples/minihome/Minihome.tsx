import { lazy, Suspense, useMemo, useState, useSyncExternalStore } from 'react';

import { createSceneDocumentController } from 'gaesup-world';

import { furnitureKind, loadMinihome, makeFurniture, MAX_FURNITURE, STORAGE_KEY } from './model';
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
  const [data, setData] = useState(initial.data);
  const [controller] = useState(() => createSceneDocumentController(initial.data.room));
  const subscribe = useMemo(
    () => (notify: () => void) => controller.subscribe(() => notify()),
    [controller],
  );
  const document = useSyncExternalStore(subscribe, controller.getSnapshot, controller.getSnapshot);
  const [tab, setTab] = useState<HomeTab>('home');
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [profileOpen, setProfileOpen] = useState(false);
  const [status, setStatus] = useState(initial.warning);
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [savedState, setSavedState] = useState(() => JSON.stringify(initial.data));
  const view = useMemo(
    () => ({ editing, selected, zoom, theme: data.theme }),
    [editing, selected, zoom, data.theme],
  );
  const object = document.objects.find((entry) => entry.id === selected);
  const snapshot = { ...data, room: document };
  const dirty = JSON.stringify(snapshot) !== savedState;
  function save() {
    try {
      const raw = JSON.stringify(snapshot);
      localStorage.setItem(STORAGE_KEY, raw);
      setSavedState(raw);
      setStatus('미니홈피를 이 브라우저에 저장했어요.');
    } catch {
      setStatus('저장하지 못했어요. 브라우저 저장 공간과 권한을 확인해주세요.');
    }
  }
  function addFurniture(kind: FurnitureKind) {
    if (document.objects.length >= MAX_FURNITURE) {
      setStatus('가구는 최대 40개까지 놓을 수 있어요.');
      return;
    }
    const item = makeFurniture(kind, ((document.objects.length % 4) - 1.5) * 0.5, 2.4);
    const result = controller.dispatch({ type: 'scene-object.create', object: item });
    if (result.accepted) {
      setSelected(item.id);
      setStatus(`${FURNITURE[kind].name}을 놓았어요. 저장하면 다음에도 그대로 만날 수 있어요.`);
    }
  }
  function move(dx: number, dz: number) {
    if (!object) return;
    controller.dispatch({
      type: 'scene-object.update',
      objectId: object.id,
      patch: {
        transform: {
          position: [
            Math.max(-3.25, Math.min(3.25, object.transform.position[0] + dx)),
            0,
            Math.max(-3.25, Math.min(3.25, object.transform.position[2] + dz)),
          ],
        },
      },
    });
  }
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
    <div className="minihome">
      <header className="home-header">
        <a href="/" className="home-brand">
          <span>m</span>mini<span className="brand-dot">.</span>home<small>by gaesup world</small>
        </a>
        <div className="header-note">마음을 담은 작은 공간, 우리만의 미니홈피</div>
        <a href="/engine" className="engine-link">
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
                        ? '햇살이 머무는 나의 방'
                        : tab === 'diary'
                          ? '평범해서 더 소중한 하루'
                          : '다녀간 마음을 남겨주세요'}
                    </h2>
                  </div>
                  <span className="handwritten">make yourself at home ♡</span>
                </div>
                {tab === 'home' && (
                  <Suspense
                    fallback={<div className="room-placeholder">미니룸을 준비하고 있어요…</div>}
                  >
                    <Miniroom controller={controller} view={view} onSelect={setSelected} />
                  </Suspense>
                )}
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
                          onClick={() => setZoom(Math.max(0.65, zoom - 0.15))}
                        >
                          −
                        </button>
                        <button
                          className="zoom-button"
                          aria-label="미니룸 확대"
                          onClick={() => setZoom(Math.min(1.65, zoom + 0.15))}
                        >
                          ＋
                        </button>
                        <button
                          className={editing ? 'decorate-button active' : 'decorate-button'}
                          onClick={() => {
                            setEditing(!editing);
                            setSelected(null);
                          }}
                        >
                          ✎ {editing ? '꾸미기 완료' : '미니룸 꾸미기'}
                        </button>
                      </div>
                    </div>
                    {editing ? (
                      <section className="decorator" aria-label="미니룸 꾸미기">
                        <div className="decoration-top">
                          <b>오늘의 취향을 더해봐요</b>
                          <div className="room-themes">
                            {(['peach', 'sage', 'lavender'] as const).map((theme) => (
                              <button
                                key={theme}
                                className={`theme-dot ${theme}`}
                                aria-label={`${theme === 'peach' ? '살구' : theme === 'sage' ? '세이지' : '라벤더'} 테마`}
                                aria-pressed={data.theme === theme}
                                onClick={() => setData({ ...data, theme })}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="furniture-tray">
                          {(Object.keys(FURNITURE) as FurnitureKind[]).map((kind) => (
                            <button
                              key={kind}
                              onClick={() => addFurniture(kind)}
                              aria-label={`${FURNITURE[kind].name} 추가`}
                            >
                              <span>{FURNITURE[kind].icon}</span>
                              {FURNITURE[kind].name}
                              <small>＋</small>
                            </button>
                          ))}
                        </div>
                        <div className="object-controls">
                          <label>
                            선택한 가구
                            <select
                              aria-label="선택한 가구"
                              value={selected ?? ''}
                              onChange={(event) => setSelected(event.target.value || null)}
                            >
                              <option value="">가구를 선택하세요</option>
                              {document.objects.map((entry, index) => (
                                <option value={entry.id} key={entry.id}>
                                  {FURNITURE[furnitureKind(entry) ?? 'table'].name} {index + 1}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div>
                            <button
                              disabled={!object}
                              aria-label="가구 왼쪽 이동"
                              onClick={() => move(-0.25, 0)}
                            >
                              ←
                            </button>
                            <button
                              disabled={!object}
                              aria-label="가구 뒤로 이동"
                              onClick={() => move(0, -0.25)}
                            >
                              ↑
                            </button>
                            <button
                              disabled={!object}
                              aria-label="가구 앞으로 이동"
                              onClick={() => move(0, 0.25)}
                            >
                              ↓
                            </button>
                            <button
                              disabled={!object}
                              aria-label="가구 오른쪽 이동"
                              onClick={() => move(0.25, 0)}
                            >
                              →
                            </button>
                            <button
                              disabled={!object}
                              aria-label="가구 회전"
                              onClick={() => {
                                if (object)
                                  controller.dispatch({
                                    type: 'scene-object.update',
                                    objectId: object.id,
                                    patch: {
                                      transform: {
                                        rotation: [
                                          0,
                                          object.transform.rotation[1] + Math.PI / 2,
                                          0,
                                        ],
                                      },
                                    },
                                  });
                              }}
                            >
                              ↻
                            </button>
                            <button
                              disabled={!object}
                              aria-label="가구 삭제"
                              onClick={() => {
                                if (object)
                                  controller.dispatch({
                                    type: 'scene-object.delete',
                                    objectId: object.id,
                                  });
                                setSelected(null);
                              }}
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </section>
                    ) : (
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
                        post();
                      }}
                    >
                      {tab === 'guestbook' && (
                        <input
                          aria-label="방명록 닉네임"
                          placeholder="이름 또는 닉네임"
                          maxLength={20}
                          value={author}
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
                        onChange={(event) => setMessage(event.target.value)}
                        maxLength={1000}
                        required
                      />
                      <div>
                        <small>{message.length} / 1,000</small>
                        <button className="decorate-button" type="submit">
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
                <div className="page-save">
                  <span role="status">
                    {status ||
                      (dirty
                        ? '아직 저장하지 않은 변경이 있어요.'
                        : '이 공간은 현재 브라우저에 보관됩니다.')}
                  </span>
                  <button onClick={save}>미니홈피 저장 {dirty && <i />}</button>
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
          LOCAL PREVIEW · 프로필·방·글은 이 브라우저에 저장됩니다. 온라인 방문·공유는 아직 연결되지
          않았습니다.
        </small>
        <a href="/engine">GAESUP WORLD ↗</a>
      </footer>
    </div>
  );
}

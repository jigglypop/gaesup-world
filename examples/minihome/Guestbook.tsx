import { useState, type FormEvent } from 'react';

import { useStored } from './stored';

type Entry = { id: string; author: string; emoji: string; text: string; at: number; mine?: boolean };

const DAY = 86_400_000;
const seed = (): Entry[] => [
  { id: 'seed-1', author: '하나', emoji: '👩‍⚕️', text: '꽃밭 너무 예뻐요 🌸 일촌 신청하고 갑니다~', at: Date.now() - DAY * 0.3 },
  { id: 'seed-2', author: '민준', emoji: '👦', text: '해변까지 달리기 시합 하자!! 내가 이김 ㅋㅋ', at: Date.now() - DAY * 1.2 },
  { id: 'seed-3', author: '산이', emoji: '🧑‍🌾', text: '텃밭 토마토 익으면 나눠 줄게요. 파도 소리 들으며 쉬다 가요.', at: Date.now() - DAY * 2.5 },
  { id: 'seed-4', author: '윤 선생님', emoji: '👩‍🏫', text: '미니룸 꾸미기 탭에서 가구 배치해 보셨어요? 자동 저장돼요!', at: Date.now() - DAY * 4 },
];

const when = (at: number) => {
  const minutes = Math.round((Date.now() - at) / 60_000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}시간 전`;
  return new Date(at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
};

/** A Cyworld guestbook sheet over the stage; entries stay in this browser. */
export function Guestbook({ author, emoji, onClose }: { author: string; emoji: string; onClose: () => void }) {
  const [entries, setEntries] = useStored<Entry[]>('guestbook', seed());
  const [text, setText] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;
    setEntries([{ id: `${Date.now()}`, author, emoji, text: body, at: Date.now(), mine: true }, ...entries]);
    setText('');
  };

  return (
    <div className="mh-sheet" role="dialog" aria-label="방명록">
      <header>
        <h3>방명록 <b>{entries.length}</b></h3>
        <button className="mh-icon-button" onClick={onClose} aria-label="닫기">✕</button>
      </header>
      <form onSubmit={submit} className="mh-guest-form">
        <span className="mh-friend-face">{emoji}</span>
        <input value={text} maxLength={120} placeholder="따뜻한 한마디를 남겨 주세요" onChange={(event) => setText(event.target.value)} />
        <button type="submit" disabled={!text.trim()}>남기기</button>
      </form>
      <ul className="mh-guest-list">
        {entries.map((entry, index) => (
          <li key={entry.id}>
            <div className="mh-guest-meta">
              <span>No.{entries.length - index}</span>
              <b>{entry.author}</b>
              <time>{when(entry.at)}</time>
              {entry.mine && (
                <button className="mh-link" onClick={() => setEntries(entries.filter((other) => other.id !== entry.id))}>삭제</button>
              )}
            </div>
            <div className="mh-guest-body">
              <span className="mh-friend-face">{entry.emoji}</span>
              <p>{entry.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

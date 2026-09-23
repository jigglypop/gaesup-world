import { useState } from 'react';

import type { RoomConnection } from './roomVisitors';

export function RoomSocial({ connection, name, onJoin, onLeave, onChat }: { connection: RoomConnection; name: string; onJoin: (room: string, name: string) => void; onLeave: () => void; onChat: (text: string) => Promise<boolean> }) {
  const [code, setCode] = useState(() => new URLSearchParams(location.search).get('visit') ?? 'gaesup');
  const [nickname, setNickname] = useState(name); const [text, setText] = useState(''); const [sending, setSending] = useState(false);
  const self = connection.peers.find(peer => peer.id === connection.id);
  const nearby = connection.peers.filter(peer => peer.id !== connection.id && self && Math.hypot(peer.position[0] - self.position[0], peer.position[2] - self.position[2]) <= 5);
  return <section className="room-social" aria-label="실시간 방문과 근거리 채팅">
    <div className="social-heading"><strong>함께 둘러보기</strong><span>{connection.status === 'online' ? `${connection.peers.length}명 접속 · ${connection.id === connection.owner ? '방 주인' : '방문자'}` : connection.status === 'offline' ? '접속 전' : '연결 중'}</span></div>
    {connection.status === 'offline' ? <form className="room-join" onSubmit={event => { event.preventDefault(); onJoin(code, nickname); }}>
      <label>방 코드<input aria-label="방 코드" value={code} maxLength={40} onChange={event => setCode(event.target.value)} required pattern="[a-zA-Z0-9_-]+" /></label>
      <label>닉네임<input aria-label="방문 닉네임" value={nickname} maxLength={24} onChange={event => setNickname(event.target.value)} required /></label><button type="submit">입장</button>
      <p>같은 방 코드로 접속하면 서로 보입니다. 첫 입장자가 공간을 공유하고 편집합니다.</p>
    </form> : <>
      <div className="social-session"><span>방 {connection.room} · 가까운 사람 {nearby.length}명</span><button onClick={() => { const url = new URL(location.href); url.searchParams.set('visit', connection.room); url.searchParams.delete('edit'); void navigator.clipboard?.writeText(url.href); }}>초대 링크 복사</button><button onClick={onLeave}>나가기</button></div>
      <div className="visitor-list">{connection.peers.map(peer => <span key={peer.id}><i style={{ background: peer.color }} />{peer.name}{peer.id === connection.id ? ' (나)' : nearby.some(entry => entry.id === peer.id) ? ' · 가까이' : ' · 멀리'}</span>)}</div>
      <div className="proximity-chat" role="log" aria-label="근거리 대화">{connection.messages.length ? connection.messages.map(message => <p key={message.id}><b>{message.author}</b> {message.text}</p>) : <p>5m 안에 있는 사람에게 대화가 전달됩니다.</p>}</div>
      <form className="chat-compose" onSubmit={event => { event.preventDefault(); if (!text.trim() || sending) return; setSending(true); void onChat(text.trim()).then(ok => { if (ok) setText(''); }).finally(() => setSending(false)); }}><input aria-label="근거리 메시지" placeholder="가까운 사람에게 메시지" maxLength={300} value={text} onChange={event => setText(event.target.value)} /><button disabled={sending || !text.trim() || connection.status !== 'online'} type="submit">보내기</button></form>
    </>}
    {connection.error && <p className="room-notice" role="status">{connection.error}</p>}
  </section>;
}

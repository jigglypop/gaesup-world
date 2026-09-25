import { useCallback, useEffect, useRef, useState } from 'react';

import { readMinihome } from './model';
import type { MinihomeData } from './types';

export type RoomPeer = { id: string; name: string; position: [number, number, number]; color: string };
export type RoomChat = { id: string; author: string; from: string; text: string; at: number };
export type RoomConnection = { status: 'offline' | 'connecting' | 'online' | 'retrying'; id: string; owner: string; room: string; peers: RoomPeer[]; messages: RoomChat[]; error: string };
const INITIAL: RoomConnection = { status: 'offline', id: '', owner: '', room: '', peers: [], messages: [], error: '' };

export function useRoomVisitors(data: MinihomeData, update: (input: MinihomeData | ((previous: MinihomeData) => MinihomeData)) => void) {
  const [connection, setConnection] = useState<RoomConnection>(INITIAL);
  const [visiting, setVisiting] = useState(false);
  const protectedLocal = useRef(false);
  const current = useRef(data); current.current = data;
  const apply = useRef(update); apply.current = update;
  const snapshot = useRef<MinihomeData | null>(null);
  const source = useRef<EventSource | null>(null);
  const auth = useRef({ id: '', token: '', room: '', owner: '' });
  const endpoint = String(import.meta.env['VITE_MINIROOM_SERVER'] ?? '').replace(/\/$/, '');
  const post = useCallback(async (payload: Record<string, unknown>) => {
    const session = auth.current; if (!session.id) return;
    const response = await fetch(`${endpoint}/__miniroom/message`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, room: session.room, id: session.id, token: session.token }) });
    if (!response.ok) throw new Error(response.status === 403 ? '방 연결이 만료됐습니다. 다시 입장해 주세요.' : '방에 변경을 보내지 못했습니다.');
  }, [endpoint]);
  const leave = useCallback(() => {
    source.current?.close(); source.current = null; auth.current = { id: '', token: '', room: '', owner: '' };
    if (protectedLocal.current && snapshot.current) {
      const home = snapshot.current; apply.current(previous => ({ ...home, diary: previous.diary, guestbook: previous.guestbook, roomSettings: previous.roomSettings }));
    }
    snapshot.current = null; protectedLocal.current = false; setVisiting(false); setConnection(INITIAL);
  }, []);
  const join = useCallback((room: string, name: string) => {
    leave(); snapshot.current = current.current;
    if (!/^[a-zA-Z0-9_-]{1,40}$/.test(room) || !name.trim()) { setConnection({ ...INITIAL, error: '방 코드는 영문·숫자·-·_ 1~40자로 입력해 주세요.' }); return; }
    const events = new EventSource(`${endpoint}/__miniroom/events?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name.trim().slice(0, 24))}`);
    source.current = events; setConnection({ ...INITIAL, status: 'connecting', room });
    events.onmessage = event => {
      if (source.current !== events) return;
      try {
        const message = JSON.parse(event.data);
        const acceptWorld = (world: unknown) => {
          if (!world || auth.current.id === auth.current.owner) return;
          const parsed = readMinihome({ ...current.current, ...world as object });
          if (!parsed) { setConnection(previous => ({ ...previous, error: '방 데이터가 올바르지 않아 적용하지 않았습니다.' })); return; }
          apply.current(previous => ({ ...parsed, diary: previous.diary, guestbook: previous.guestbook, roomSettings: previous.roomSettings }));
        };
        if (message.type === 'welcome') {
          if (message.id !== message.owner && !protectedLocal.current) { snapshot.current = current.current; protectedLocal.current = true; setVisiting(true); }
          auth.current = { id: message.id, token: message.token, room, owner: message.owner };
          setConnection(previous => ({ ...previous, status: 'online', id: message.id, owner: message.owner, peers: message.peers, error: '' })); acceptWorld(message.world);
        } else if (message.type === 'peers') {
          auth.current.owner = message.owner;
          setConnection(previous => ({ ...previous, owner: message.owner, peers: message.peers }));
        } else if (message.type === 'presence') setConnection(previous => ({ ...previous, peers: previous.peers.map(peer => peer.id === message.peer.id ? message.peer : peer) }));
        else if (message.type === 'chat') setConnection(previous => ({ ...previous, messages: [...previous.messages, message].slice(-60) }));
        else if (message.type === 'world') acceptWorld(message.world);
      } catch { setConnection(previous => ({ ...previous, error: '방 메시지를 읽지 못했습니다.' })); }
    };
    events.onerror = () => {
      if (source.current !== events) return;
      if (events.readyState === EventSource.CLOSED) { leave(); setConnection({ ...INITIAL, error: '방 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해 주세요.' }); }
      else setConnection(previous => ({ ...previous, status: 'retrying', error: '방 서버에 다시 연결하는 중입니다.' }));
    };
  }, [endpoint, leave]);
  useEffect(() => () => source.current?.close(), []);
  useEffect(() => {
    if (connection.status !== 'online') return;
    let last = ''; let busy = false;
    const timer = window.setInterval(() => {
      const position = window.miniroom?.diagnostics().avatarPosition;
      if (!position || busy) return;
      const rounded = position.map(value => Math.round(value * 100) / 100); const key = rounded.join(); if (key === last) return;
      busy = true; void post({ type: 'presence', position: rounded }).then(() => { last = key; }).catch(error => setConnection(previous => ({ ...previous, error: error.message }))).finally(() => { busy = false; });
    }, 100);
    return () => clearInterval(timer);
  }, [connection.status, connection.id, post]);
  // The session keeps unchanged domains by reference, so these identities change only when the shared world does.
  const { version, profile, theme, room, terrain } = data;
  useEffect(() => {
    if (connection.status !== 'online' || connection.id !== connection.owner) return;
    const timer = setTimeout(() => { void post({ type: 'world', world: { version, profile, theme, room, terrain } }).catch(error => setConnection(previous => ({ ...previous, error: error.message }))); }, 180);
    return () => clearTimeout(timer);
  }, [version, profile, theme, room, terrain, connection.status, connection.id, connection.owner, post]);
  const chat = async (text: string) => {
    try { await post({ type: 'chat', text }); return true; }
    catch (error) { setConnection(previous => ({ ...previous, error: error instanceof Error ? error.message : '전송 실패' })); return false; }
  };
  return { connection, join, leave, chat, visiting, isGuest: !!connection.id && connection.id !== connection.owner };
}

import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import { createMinihomeRoomService } from './minihome-room-service.mjs';

test('room sessions enforce origin, sender identity, host editing, proximity and room isolation', async () => {
  const service = createMinihomeRoomService({ allowedOrigin: 'https://example.test' });
  const server = createServer((request, response) => void service.handle(request, response));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`; const clients = [];
  async function connect(room, name) {
    const abort = new AbortController();
    const response = await fetch(`${base}/__miniroom/events?room=${room}&name=${name}`, { headers: { Origin: 'https://example.test' }, signal: abort.signal });
    assert.equal(response.status, 200); const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
    const messages = []; let welcome;
    async function next() {
      while (true) {
        const boundary = buffer.indexOf('\n\n');
        if (boundary >= 0) { const event = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2); if (event.startsWith('data: ')) return JSON.parse(event.slice(6)); }
        else { const chunk = await reader.read(); if (chunk.done) return null; buffer += decoder.decode(chunk.value, { stream: true }); }
      }
    }
    welcome = await next(); assert.equal(welcome.type, 'welcome');
    const pump = (async () => { try { for (;;) { const message = await next(); if (!message) break; messages.push(message); } } catch (error) { if (!abort.signal.aborted) throw error; } })();
    const client = { ...welcome, room, messages, abort, pump }; clients.push(client); return client;
  }
  async function post(client, message) {
    return fetch(`${base}/__miniroom/message`, { method: 'POST', headers: { Origin: 'https://example.test', 'Content-Type': 'application/json' }, body: JSON.stringify({ id: client.id, token: client.token, room: client.room, ...message }) });
  }
  const until = async condition => { for (let i = 0; i < 50; i++) { if (condition()) return; await new Promise(resolve => setTimeout(resolve, 10)); } assert.ok(condition(), 'event not received'); };
  try {
    assert.equal((await fetch(`${base}/__miniroom/events?room=a&name=Bad`, { headers: { Origin: 'https://other.test' } })).status, 403);
    const owner = await connect('a', 'Owner'); const guest = await connect('a', 'Guest'); const other = await connect('b', 'Other');
    assert.equal(owner.owner, owner.id); assert.equal(guest.owner, owner.id);
    assert.equal((await post(guest, { type: 'world', world: {} })).status, 403);
    assert.equal((await post(owner, { type: 'presence', token: '가'.repeat(36), position: [0, 0, 0] })).status, 403);
    assert.equal((await post(owner, { type: 'presence', position: [50, 0, 0] })).status, 400);
    assert.equal((await post(owner, { type: 'chat', text: '가까운 대화' })).status, 200);
    await until(() => guest.messages.some(message => message.type === 'chat' && message.text === '가까운 대화'));
    assert.equal(other.messages.some(message => message.type === 'chat'), false);
    assert.equal((await post(guest, { type: 'presence', position: [10, 0, 10] })).status, 200);
    await post(owner, { type: 'chat', text: '멀리 있는 대화' }); await until(() => owner.messages.some(message => message.text === '멀리 있는 대화'));
    assert.equal(guest.messages.some(message => message.text === '멀리 있는 대화'), false);
    owner.abort.abort(); await owner.pump;
    await until(() => guest.messages.some(message => message.type === 'peers' && message.owner === guest.id));
  } finally {
    for (const client of clients) client.abort.abort(); await Promise.allSettled(clients.map(client => client.pump)); service.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  }
});

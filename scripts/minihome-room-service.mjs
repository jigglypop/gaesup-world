import { randomUUID, timingSafeEqual } from 'node:crypto';

/** Small, ephemeral spatial room service shared by Vite and the standalone server. */
export function createMinihomeRoomService({ allowedOrigin } = {}) {
  const rooms = new Map();
  const send = (client, message) => { if (!client.response.destroyed) client.response.write(`data: ${JSON.stringify(message)}\n\n`); };
  const peers = room => [...room.clients.values()].map(client => ({ id: client.id, name: client.name, position: client.position, color: client.color }));
  const broadcast = (room, message) => { for (const client of room.clients.values()) send(client, message); };
  const heartbeat = setInterval(() => { for (const room of rooms.values()) for (const client of room.clients.values()) client.response.write(': heartbeat\n\n'); }, 15000);
  heartbeat.unref();
  const reply = (response, status, data) => { response.writeHead(status, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(data)); };
  async function handle(request, response, next = () => reply(response, 404, { error: 'Not found' })) {
    const url = new URL(request.url ?? '/', 'http://localhost');
    if (!url.pathname.startsWith('/__miniroom/')) { next(); return; }
    const origin = request.headers.origin;
    const acceptedOrigin = allowedOrigin ?? `${request.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http'}://${request.headers.host}`;
    if (origin && origin !== acceptedOrigin) { reply(response, 403, { error: 'Origin not allowed' }); return; }
    if (origin) { response.setHeader('Access-Control-Allow-Origin', origin); response.setHeader('Vary', 'Origin'); }
    if (request.method === 'OPTIONS') { response.setHeader('Access-Control-Allow-Headers', 'Content-Type'); response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); response.writeHead(204); response.end(); return; }
    if (url.pathname === '/__miniroom/events' && request.method === 'GET') {
      const code = url.searchParams.get('room') ?? ''; const name = (url.searchParams.get('name') ?? '').trim().slice(0, 24);
      if (!/^[a-zA-Z0-9_-]{1,40}$/.test(code) || !name) { reply(response, 400, { error: 'Invalid room or name' }); return; }
      let room = rooms.get(code);
      if (!room) { if (rooms.size >= 100) { reply(response, 503, { error: 'Room capacity reached' }); return; } room = { clients: new Map(), world: null, owner: null, expiry: null }; rooms.set(code, room); }
      if (room.clients.size >= 24) { reply(response, 409, { error: 'Room is full' }); return; }
      clearTimeout(room.expiry);
      const id = randomUUID(); const token = randomUUID();
      const client = { id, token, name, response, position: [0, 0, 2], color: ['#759ee7', '#dc92b1', '#6daa96', '#dcb56a'][room.clients.size % 4], messages: 0, rateAt: Date.now() };
      room.clients.set(id, client); if (!room.owner) room.owner = id;
      response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' }); response.flushHeaders();
      send(client, { type: 'welcome', id, token, owner: room.owner, peers: peers(room), world: room.world });
      broadcast(room, { type: 'peers', owner: room.owner, peers: peers(room) });
      request.on('close', () => {
        room.clients.delete(id); if (room.owner === id) room.owner = room.clients.keys().next().value ?? null;
        broadcast(room, { type: 'peers', owner: room.owner, peers: peers(room) });
        if (!room.clients.size) { room.expiry = setTimeout(() => rooms.delete(code), 60000); room.expiry.unref(); }
      });
      return;
    }
    if (url.pathname !== '/__miniroom/message' || request.method !== 'POST') { reply(response, 404, { error: 'Not found' }); return; }
    const chunks = []; let length = 0; let data;
    try {
      for await (const chunk of request) { length += chunk.length; if (length > 512000) { reply(response, 413, { error: 'Message too large' }); return; } chunks.push(chunk); }
      data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch { reply(response, 400, { error: 'Invalid JSON' }); return; }
    const room = rooms.get(data?.room); const client = room?.clients.get(data?.id);
    if (!client || typeof data.token !== 'string' || Buffer.byteLength(data.token) !== Buffer.byteLength(client.token) || !timingSafeEqual(Buffer.from(data.token), Buffer.from(client.token))) { reply(response, 403, { error: 'Session expired' }); return; }
    if (Date.now() - client.rateAt > 1000) { client.messages = 0; client.rateAt = Date.now(); }
    if (++client.messages > 20) { reply(response, 429, { error: 'Too many messages' }); return; }
    if (data.type === 'presence') {
      if (!Array.isArray(data.position) || data.position.length !== 3 || !data.position.every(value => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 12) || data.position[1] !== 0) { reply(response, 400, { error: 'Invalid position' }); return; }
      client.position = data.position; broadcast(room, { type: 'presence', peer: { id: client.id, name: client.name, position: client.position, color: client.color } });
    } else if (data.type === 'chat') {
      if (typeof data.text !== 'string' || !data.text.trim() || data.text.length > 300) { reply(response, 400, { error: 'Invalid chat' }); return; }
      const message = { type: 'chat', id: randomUUID(), author: client.name, from: client.id, text: data.text.trim(), at: Date.now() };
      for (const recipient of room.clients.values()) if (Math.hypot(recipient.position[0] - client.position[0], recipient.position[2] - client.position[2]) <= 5) send(recipient, message);
    } else if (data.type === 'world') {
      if (room.owner !== client.id) { reply(response, 403, { error: 'Only the host can edit the room' }); return; }
      const world = data.world;
      if (!world || world.version !== 1 || !Array.isArray(world.room?.objects) || world.room.objects.length > 160 || !Array.isArray(world.terrain?.tiles) || world.terrain.tiles.length !== 576) { reply(response, 400, { error: 'Invalid world' }); return; }
      room.world = { version: world.version, room: world.room, terrain: world.terrain, theme: world.theme, profile: world.profile };
      broadcast(room, { type: 'world', world: room.world });
    } else { reply(response, 400, { error: 'Unknown message type' }); return; }
    reply(response, 200, { ok: true });
  }
  return { handle, close() { clearInterval(heartbeat); for (const room of rooms.values()) { clearTimeout(room.expiry); for (const client of room.clients.values()) client.response.end(); } rooms.clear(); } };
}

export function minihomeRoomPlugin() {
  let service;
  const attach = server => {
    service = createMinihomeRoomService(); server.middlewares.use((request, response, next) => { void service.handle(request, response, next).catch(error => { if (!response.headersSent) { response.writeHead(500); response.end('Room service error'); } server.config.logger.error(String(error)); }); });
    server.httpServer?.once('close', () => service.close());
  };
  return { name: 'minihome-spatial-rooms', configureServer: attach, configurePreviewServer: attach, closeBundle() { service?.close(); } };
}

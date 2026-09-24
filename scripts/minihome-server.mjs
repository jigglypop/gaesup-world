import { createServer } from 'node:http';

import { createMinihomeRoomService } from './minihome-room-service.mjs';
const port = Number(process.env.MINIHOME_PORT ?? 5187);
const service = createMinihomeRoomService({ allowedOrigin: process.env.MINIHOME_ORIGIN ?? 'http://127.0.0.1:5174' });
const server = createServer((request, response) => { void service.handle(request, response).catch(error => { console.error(error); if (!response.headersSent) response.writeHead(500); response.end(); }); });
server.listen(port, process.env.MINIHOME_HOST ?? '127.0.0.1', () => console.log(`Minihome room service: http://127.0.0.1:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { service.close(); server.close(); });

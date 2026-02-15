import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8090 });

const rooms = new Map();

function generateClientId() {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

wss.on('connection', (ws) => {
  const clientId = generateClientId();
  ws.clientId = clientId;
  ws.roomId = null;
  
  console.log(`[Server] New connection: ${clientId}`);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`[Server] Message from ${clientId}:`, message.type);
      
      switch (message.type) {
        case 'Join': {
          const { room_id, name, color } = message;
          ws.roomId = room_id;
          ws.playerName = name;
          ws.playerColor = color;
          
          if (!rooms.has(room_id)) {
            rooms.set(room_id, new Map());
          }
          
          const room = rooms.get(room_id);
          const playerState = {
            name,
            color,
            position: [0, 0, 0],
            // Quaternion (w, x, y, z)
            rotation: [1, 0, 0, 0],
            animation: 'idle'
          };
          
          room.set(clientId, { ws, state: playerState });
          
          const roomState = {};
          room.forEach((player, id) => {
            if (id !== clientId) {
              roomState[id] = player.state;
            }
          });
          
          ws.send(JSON.stringify({
            type: 'Welcome',
            client_id: clientId,
            room_state: roomState
          }));
          
          room.forEach((player, id) => {
            if (id !== clientId && player.ws.readyState === WebSocket.OPEN) {
              player.ws.send(JSON.stringify({
                type: 'PlayerJoined',
                client_id: clientId,
                state: playerState
              }));
            }
          });
          
          console.log(`[Server] ${name} joined room ${room_id}. Total players: ${room.size}`);
          break;
        }
        
        case 'Update': {
          if (!ws.roomId) break;
          
          const room = rooms.get(ws.roomId);
          if (!room) break;
          
          const player = room.get(clientId);
          if (player) {
            player.state = { ...player.state, ...message.state };
            
            room.forEach((p, id) => {
              if (id !== clientId && p.ws.readyState === WebSocket.OPEN) {
                p.ws.send(JSON.stringify({
                  type: 'PlayerUpdate',
                  client_id: clientId,
                  state: message.state
                }));
              }
            });
          }
          break;
        }
        
        case 'Leave': {
          handleDisconnect(ws, clientId);
          break;
        }

        case 'Chat': {
          if (!ws.roomId) break;
          const room = rooms.get(ws.roomId);
          if (!room) break;

          const { text, range } = message;
          const safeText = typeof text === 'string' ? text.slice(0, 200) : '';
          if (!safeText) break;

          const sender = room.get(clientId);
          const senderPos = sender?.state?.position;

          room.forEach((p, id) => {
            if (id === clientId) return;
            if (p.ws.readyState !== WebSocket.OPEN) return;

            // Optional proximity broadcast (gather-town feel)
            if (typeof range === 'number' && range > 0 && Array.isArray(senderPos)) {
              const pos = p?.state?.position;
              if (Array.isArray(pos) && pos.length >= 3) {
                const dx = (pos[0] ?? 0) - (senderPos[0] ?? 0);
                const dy = (pos[1] ?? 0) - (senderPos[1] ?? 0);
                const dz = (pos[2] ?? 0) - (senderPos[2] ?? 0);
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist > range) return;
              }
            }

            p.ws.send(JSON.stringify({
              type: 'Chat',
              client_id: clientId,
              text: safeText,
              timestamp: Date.now(),
            }));
          });
          break;
        }
      }
    } catch (error) {
      console.error('[Server] Error processing message:', error);
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws, clientId);
  });

  ws.on('error', (error) => {
    console.error(`[Server] Error for ${clientId}:`, error);
  });
});

function handleDisconnect(ws, clientId) {
  console.log(`[Server] Client disconnected: ${clientId}`);
  
  if (ws.roomId) {
    const room = rooms.get(ws.roomId);
    if (room) {
      room.delete(clientId);
      
      room.forEach((player) => {
        if (player.ws.readyState === WebSocket.OPEN) {
          player.ws.send(JSON.stringify({
            type: 'PlayerLeft',
            client_id: clientId
          }));
        }
      });
      
      if (room.size === 0) {
        rooms.delete(ws.roomId);
        console.log(`[Server] Room ${ws.roomId} deleted (empty)`);
      }
    }
  }
}

console.log('[Server] WebSocket server running on ws://localhost:8090');


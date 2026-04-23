import type { NetworkPayload } from '../types';

// Web Worker for handling WebSocket communication and JSON parsing
// Offloads network processing from the main thread.

export type WorkerMessage = 
  | { type: 'INIT'; sharedBuffer: SharedArrayBuffer }
  | { type: 'CONNECT'; url: string; roomId: string; playerName: string; playerColor: string }
  | { type: 'DISCONNECT' }
  | { type: 'SEND'; payload: string };

let ws: WebSocket | null = null;
let floatView: Float32Array | null = null;

// Map clientId to an index in the SharedArrayBuffer (0 to 1023)
const clientIndexMap = new Map<string, number>();
let nextAvailableIndex = 0;

const getClientIndex = (id: string) => {
  if (clientIndexMap.has(id)) return clientIndexMap.get(id)!;
  if (nextAvailableIndex >= 1024) return -1; // Max 1024 players supported in this buffer
  const idx = nextAvailableIndex++;
  clientIndexMap.set(id, idx);
  // Store the mapping in SAB so main thread knows who is where? 
  // No, just postMessage the index mapping to main thread when a new player joins.
  return idx;
};

// Data layout per player: 16 floats (64 bytes)
// 0,1,2: position x,y,z
// 3,4,5,6: rotation x,y,z,w
// 7,8,9: velocity x,y,z
// 10: active flag (1 = active, 0 = inactive)
// 11: updated timestamp
const STRIDE = 16;

type TransformState = {
  position?: [number, number, number];
  rotation?: [number, number, number, number];
  velocity?: [number, number, number];
  [key: string]: NetworkPayload;
};

type ServerMessage = {
  type: string;
  client_id?: string;
  state?: TransformState;
  [key: string]: NetworkPayload;
};

function isTransformState(value: NetworkPayload): value is TransformState {
  return value !== null && typeof value === 'object';
}

self.onmessage = (e: MessageEvent) => {
  const data = e.data;

  switch (data.type) {
    case 'INIT':
      const buffer = data.sharedBuffer;
      floatView = new Float32Array(buffer);
      break;

    case 'CONNECT':
      if (ws) ws.close();
      ws = new WebSocket(data.url);

      ws.onopen = () => {
        self.postMessage({ type: 'WS_OPEN' });
        ws?.send(JSON.stringify({
          type: 'Join',
          room_id: data.roomId,
          name: data.playerName,
          color: data.playerColor
        }));
      };

      ws.onmessage = async (event) => {
        let text = '';
        if (typeof event.data === 'string') {
          text = event.data;
        } else if (event.data instanceof Blob) {
          text = await event.data.text();
        } else if (event.data instanceof ArrayBuffer) {
          text = new TextDecoder().decode(new Uint8Array(event.data));
        }

        try {
          const msg = JSON.parse(text);
          handleServerMessage(msg);
        } catch {
          self.postMessage({ type: 'WS_ERROR', error: 'Parse failed' });
        }
      };

      ws.onerror = () => self.postMessage({ type: 'WS_ERROR', error: 'WebSocket Error' });
      ws.onclose = (event) => self.postMessage({ type: 'WS_CLOSE', code: event.code, reason: event.reason });
      break;

    case 'DISCONNECT':
      if (ws) {
        try {
          ws.send(JSON.stringify({ type: 'Leave' }));
          ws.close();
        } catch {}
        ws = null;
      }
      break;

    case 'SEND':
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(data.payload);
      }
      break;
  }
};

function handleServerMessage(msg: ServerMessage) {
  // If it's a transform update and we have SAB, write it directly and skip postMessage if metadata didn't change
  if (msg.type === 'PlayerUpdate' && floatView) {
    const clientId = typeof msg.client_id === 'string' ? msg.client_id : null;
    const state = isTransformState(msg.state) ? msg.state : null;
    if (!clientId) return;
    const idx = getClientIndex(clientId);

    if (idx !== -1 && state) {
      const offset = idx * STRIDE;
      let transformUpdated = false;

      if (state.position) {
        floatView[offset + 0] = state.position[0];
        floatView[offset + 1] = state.position[1];
        floatView[offset + 2] = state.position[2];
        transformUpdated = true;
      }
      if (state.rotation) {
        floatView[offset + 3] = state.rotation[0];
        floatView[offset + 4] = state.rotation[1];
        floatView[offset + 5] = state.rotation[2];
        floatView[offset + 6] = state.rotation[3];
        transformUpdated = true;
      }
      if (state.velocity) {
        floatView[offset + 7] = state.velocity[0];
        floatView[offset + 8] = state.velocity[1];
        floatView[offset + 9] = state.velocity[2];
        transformUpdated = true;
      }
      
      if (transformUpdated) {
        floatView[offset + 10] = 1; // mark active
        floatView[offset + 11] = Date.now();
        // Send a lightweight tick to main thread so it knows to read, or let it just poll SAB.
        // We'll still send the message but strip the heavy transform arrays to save JS copy overhead
        const lightState = { ...state };
        delete lightState.position;
        delete lightState.rotation;
        delete lightState.velocity;
        
        self.postMessage({
          type: 'WS_MESSAGE',
          data: { ...msg, state: lightState, _sabIndex: idx }
        });
        return;
      }
    }
  } else if (msg.type === 'PlayerJoined' && floatView) {
    const clientId = typeof msg.client_id === 'string' ? msg.client_id : null;
    if (!clientId) return;
    const idx = getClientIndex(clientId);
    if (idx !== -1) {
      self.postMessage({
        type: 'WS_MESSAGE',
        data: { ...msg, _sabIndex: idx }
      });
      return;
    }
  }

  // Pass-through other messages
  self.postMessage({ type: 'WS_MESSAGE', data: msg });
}

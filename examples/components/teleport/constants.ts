import { createTeleportDestination } from 'gaesup-world';

export const TELEPORT_POINTS = [
  createTeleportDestination({ id: 'spawn', name: '시작 지점', position: [0, 0.8, 0], markerColor: '#61dafb' }),
  createTeleportDestination({ id: 'north-field', name: '북쪽 들판', position: [36, 0.8, 0], markerColor: '#7ddc83' }),
  createTeleportDestination({ id: 'west-field', name: '서쪽 들판', position: [-36, 0.8, 18], markerColor: '#ffd166' }),
  createTeleportDestination({ id: 'stairs', name: '계단', position: [92, 0.8, 20], markerColor: '#f78c6b' }),
  createTeleportDestination({ id: 'vehicle-pad', name: '차량 위치', position: [-66, 0.8, 30], markerColor: '#c792ea' }),
  createTeleportDestination({ id: 'airplane-pad', name: '비행기 위치', position: [66, 0.8, 40], markerColor: '#82aaff' }),
  createTeleportDestination({ id: 'cinematic-pad', name: '연출 위치', position: [-30, 0.8, 72], markerColor: '#ffcb6b' }),
];

import { parseMinihome } from './model';
import type { MinihomeData } from './types';

const SHARE_PREFIX = '#room=';
const MAX_LINK_LENGTH = 24_000;

export function createShareLink(data: MinihomeData, url: string): string {
  const publicHome: MinihomeData = { ...data, diary: [], guestbook: [] };
  const bytes = new TextEncoder().encode(JSON.stringify(publicHome));
  const encoded = btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
  const result = `${url.split('#')[0]}${SHARE_PREFIX}${encoded}`;
  if (result.length > MAX_LINK_LENGTH) throw new Error('공유 링크가 너무 깁니다. 파일 백업을 사용해 주세요.');
  return result;
}

export function readShareLink(hash: string): MinihomeData | null {
  if (!hash.startsWith(SHARE_PREFIX) || hash.length > MAX_LINK_LENGTH) return null;
  try {
    const decoded = atob(hash.slice(SHARE_PREFIX.length));
    return parseMinihome(new TextDecoder().decode(Uint8Array.from(decoded, (char) => char.charCodeAt(0))));
  } catch { return null; }
}

export function downloadJson(data: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

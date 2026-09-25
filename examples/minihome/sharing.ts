import { parseMinihome } from './model';
import type { MinihomeData } from './types';

// `#home=` carries deflate-compressed JSON; `#room=` links (plain JSON) made before compression still open.
const SHARE_PREFIX = '#home=';
const LEGACY_PREFIX = '#room=';
const MAX_LINK_LENGTH = 24_000;
const MAX_HOME_BYTES = 2 * 1024 * 1024;

const toBase64 = (bytes: Uint8Array) => btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
const fromBase64 = (text: string) => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));

/** Runs bytes through a (de)compression stream, refusing output past `limit` bytes. */
async function transform(bytes: Uint8Array, stream: CompressionStream | DecompressionStream, limit = Infinity): Promise<Uint8Array> {
  const reader = new Blob([bytes as BlobPart]).stream().pipeThrough(stream).getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
    length += chunk.value.length;
    if (length > limit) { await reader.cancel(); throw new Error('Shared home is too large'); }
    chunks.push(chunk.value);
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

export async function createShareLink(data: MinihomeData, url: string): Promise<string> {
  const publicHome: MinihomeData = { ...data, diary: [], guestbook: [] };
  const packed = await transform(new TextEncoder().encode(JSON.stringify(publicHome)), new CompressionStream('deflate-raw'));
  const address = new URL(url); address.hash = ''; address.searchParams.delete('edit'); address.searchParams.delete('visit');
  const result = `${address.href}${SHARE_PREFIX}${toBase64(packed)}`;
  if (result.length > MAX_LINK_LENGTH) throw new Error('공유 링크가 너무 깁니다. 파일 백업을 사용해 주세요.');
  return result;
}

export function isShareLink(hash: string): boolean {
  return hash.startsWith(SHARE_PREFIX) || hash.startsWith(LEGACY_PREFIX);
}

export async function readShareLink(hash: string): Promise<MinihomeData | null> {
  if (!isShareLink(hash) || hash.length > MAX_LINK_LENGTH) return null;
  try {
    const bytes = hash.startsWith(LEGACY_PREFIX)
      ? fromBase64(hash.slice(LEGACY_PREFIX.length))
      : await transform(fromBase64(hash.slice(SHARE_PREFIX.length)), new DecompressionStream('deflate-raw'), MAX_HOME_BYTES);
    return parseMinihome(new TextDecoder().decode(bytes));
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

export const MAX_REMOTE_PLAYER_NAME_LENGTH = 64;
export const MAX_REMOTE_PLAYER_FIELD_LENGTH = 64;
export const MAX_REMOTE_MODEL_URL_LENGTH = 2048;
export const MAX_REMOTE_CHAT_TEXT_LENGTH = 200;
/** A chat bubble shows one line per peer, so a few messages a second is plenty. */
export const MAX_REMOTE_CHATS_PER_SECOND = 4;
/** Upper bound for one inbound wire message before JSON parsing, shared by presence and visit channels. */
export const MAX_REMOTE_WIRE_MESSAGE_LENGTH = 5 * 1024 * 1024;
export const MAX_VISIT_SNAPSHOT_DOMAINS = 64;

type RemotePlayerStringKey = 'name' | 'color' | 'animation';

const REMOTE_STRING_LIMITS: Readonly<Record<RemotePlayerStringKey, number>> = {
  name: MAX_REMOTE_PLAYER_NAME_LENGTH,
  color: MAX_REMOTE_PLAYER_FIELD_LENGTH,
  animation: MAX_REMOTE_PLAYER_FIELD_LENGTH,
};

export function clampRemoteString(key: RemotePlayerStringKey, value: string): string {
  return value.slice(0, REMOTE_STRING_LIMITS[key]);
}

type TokenBucket = { tokens: number; refilledAt: number };

/** One token bucket per remote peer: a burst of `rate` messages, then `rate` per second. */
export class PeerRateLimiter {
  private readonly buckets = new Map<string, TokenBucket>();
  private readonly rate: number;
  private readonly burst: number;

  constructor(ratePerSecond: number) {
    this.rate = ratePerSecond;
    this.burst = Math.max(1, ratePerSecond);
  }

  allow(peerId: string, now: number): boolean {
    const bucket = this.buckets.get(peerId);
    if (!bucket) {
      this.buckets.set(peerId, { tokens: this.burst - 1, refilledAt: now });
      return true;
    }
    bucket.tokens = Math.min(this.burst, bucket.tokens + ((now - bucket.refilledAt) * this.rate) / 1000);
    bucket.refilledAt = now;
    if (bucket.tokens < 1) return false;
    bucket.tokens -= 1;
    return true;
  }

  forget(peerId: string): void {
    this.buckets.delete(peerId);
  }

  clear(): void {
    this.buckets.clear();
  }
}

export function isTrustedRemoteModelUrl(url: string, allowedOrigins: readonly string[] = []): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > MAX_REMOTE_MODEL_URL_LENGTH) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
  return allowedOrigins.includes(parsed.origin);
}

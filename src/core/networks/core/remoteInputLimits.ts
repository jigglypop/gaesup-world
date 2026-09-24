export const MAX_REMOTE_PLAYER_NAME_LENGTH = 64;
export const MAX_REMOTE_PLAYER_FIELD_LENGTH = 64;
export const MAX_REMOTE_MODEL_URL_LENGTH = 2048;
export const MAX_REMOTE_CHAT_TEXT_LENGTH = 200;
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

export const MAX_REMOTE_PLAYER_NAME_LENGTH = 64;
export const MAX_REMOTE_PLAYER_FIELD_LENGTH = 128;
export const MAX_REMOTE_MODEL_URL_LENGTH = 2048;
export const MAX_REMOTE_CHAT_TEXT_LENGTH = 500;
export const MAX_VISIT_WIRE_MESSAGE_LENGTH = 5 * 1024 * 1024;
export const MAX_VISIT_SNAPSHOT_DOMAINS = 64;

const REMOTE_STRING_LIMITS: Record<string, number> = {
  name: MAX_REMOTE_PLAYER_NAME_LENGTH,
  color: MAX_REMOTE_PLAYER_FIELD_LENGTH,
  animation: MAX_REMOTE_PLAYER_FIELD_LENGTH,
  modelUrl: MAX_REMOTE_MODEL_URL_LENGTH,
};

export function isRemoteStringWithinLimit(key: string, value: string): boolean {
  return value.length <= (REMOTE_STRING_LIMITS[key] ?? MAX_REMOTE_PLAYER_FIELD_LENGTH);
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

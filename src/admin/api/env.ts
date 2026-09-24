export function readViteServerUrl(): string | undefined {
  return import.meta.env.VITE_SERVER_URL?.trim() || undefined;
}

import APIBuilder from "./builder";
import { readViteServerUrl } from "./env";
import { adminToken } from "./token";
import { loginFormType, registerFormType, userType } from "../store/types";

declare global {
  var __GAESUP_SERVER_URL__: string | undefined;
}

const DEFAULT_SERVER_URL = "http://localhost:3001";

// Allow runtime override without rebuilding the library/app.
// Example: `window.__GAESUP_SERVER_URL__ = 'https://api.example.com'`
function serverUrl(): string {
  return globalThis.__GAESUP_SERVER_URL__?.trim() || readViteServerUrl() || DEFAULT_SERVER_URL;
}

export function isUserType(value: unknown): value is userType {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate["id"] === "string"
    && typeof candidate["username"] === "string"
    && Array.isArray(candidate["roles"])
    && candidate["roles"].every((role) => typeof role === "string");
}

function requireUser(value: unknown): userType {
  if (!isUserType(value)) throw new TypeError("Admin API returned an invalid user payload");
  return { id: value.id, username: value.username, roles: [...value.roles] };
}

function requireIssuedToken(headers: Record<string, string>): string {
  const token = headers["token"]?.trim();
  if (!token) throw new TypeError("Admin API did not issue a session token");
  return token;
}

export type AdminSession = { user: userType; token: string };

export const tokenAsync = async () => adminToken.get();

export const checkApi = async (): Promise<userType> => {
  const api = APIBuilder.get(`/auth/check`)
    .baseURL(serverUrl())
    .setAuth()
    .build();
  const result = await api.call<unknown>();
  return requireUser(result.data);
};

/** Returns the issued session; the caller decides whether it is still current before storing it. */
export const loginApi = async (loginForm: loginFormType): Promise<AdminSession> => {
  const api = APIBuilder.post(`/auth/login`, loginForm)
    .baseURL(serverUrl())
    .build();
  const result = await api.call<unknown>();
  return { user: requireUser(result.data), token: requireIssuedToken(result.headers) };
};

export const registerApi = async (registerForm: registerFormType): Promise<AdminSession> => {
  const api = APIBuilder.post(`/auth/register`, registerForm)
    .baseURL(serverUrl())
    .build();
  const result = await api.call<unknown>();
  return { user: requireUser(result.data), token: requireIssuedToken(result.headers) };
};

export const logoutSession = (): void => {
  adminToken.clear();
};

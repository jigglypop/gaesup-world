import APIBuilder from "./builder";
import { loginFormType, registerFormType, userType } from "../store/types";

const cache = {
  get(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string | null | undefined) {
    try {
      if (value == null) return;
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
};

// Allow runtime override without rebuilding the library/app.
// Example: `window.__GAESUP_SERVER_URL__ = 'https://api.example.com'`
const SERVER_URL =
  (typeof (globalThis as unknown as { __GAESUP_SERVER_URL__?: unknown }).__GAESUP_SERVER_URL__ === 'string' &&
  (globalThis as unknown as { __GAESUP_SERVER_URL__?: string }).__GAESUP_SERVER_URL__?.trim()
    ? (globalThis as unknown as { __GAESUP_SERVER_URL__?: string }).__GAESUP_SERVER_URL__!.trim()
    : (import.meta.env.VITE_SERVER_URL?.trim() || "http://localhost:3001"));

export const tokenAsync = async () => {
  const token = cache.get("token");
  return token;
};

export const checkApi = async () => {
  const api = APIBuilder.get(`/auth/check`)
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<userType>();
  const { data } = result;
  return data;
};

export const loginApi = async (loginForm: loginFormType) => {
  const api = APIBuilder.post(`/auth/login`, loginForm)
    .baseURL(SERVER_URL)
    .build();
  const result = await api.call<userType>();
  const { data } = result;
  cache.set("token", result.headers['token']);
  return data;
};

export const registerApi = async (registerForm: registerFormType) => {
  const api = APIBuilder.post(`/auth/register`, registerForm)
    .baseURL(SERVER_URL)
    .build();
  const result = await api.call<userType>();
  const { data } = result;
  cache.set("token", result.headers['token']);
  return data;
}; 
import APIBuilder from "./builder";
import { loginFormType, registerFormType, userType } from "../store/types";
import cache from "../utils/cache";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:3001";

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
  cache.set("token", result.headers.token);
  return data;
};

export const registerApi = async (registerForm: registerFormType) => {
  const api = APIBuilder.post(`/auth/register`, registerForm)
    .baseURL(SERVER_URL)
    .build();
  const result = await api.call<userType>();
  const { data } = result;
  cache.set("token", result.headers.token);
  return data;
}; 
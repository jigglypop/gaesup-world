import axios, { AxiosPromise } from "axios";
import { HTTPHeaders, HTTPMethod, HTTPParams } from "./type";

export default class API {
  readonly method: HTTPMethod;
  readonly url: string;
  baseURL?: string;
  headers?: HTTPHeaders;
  params?: HTTPParams;
  data?: unknown;
  timeout?: number;
  withCredentials?: boolean;
  token?: string | null;

  constructor(method: HTTPMethod, url: string) {
    this.method = method;
    this.url = url;
  }

  call<T>(): AxiosPromise<T> {
    const http = axios.create();
    http.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error.response.data);
      }
    );
    return http.request({ ...this });
  }
}

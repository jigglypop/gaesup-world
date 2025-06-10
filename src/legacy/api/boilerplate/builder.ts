import { PUBLIC_URL } from "@constants/url";
import cache from "@utils/cache";
import API from "./API";
import { HTTPHeaders, HTTPMethod, HTTPParams } from "./type";

const apiHost = PUBLIC_URL;

export default class APIBuilder {
  private _instance: API;

  constructor(method: HTTPMethod, url: string, data?: unknown) {
    this._instance = new API(method, url);
    this._instance.baseURL = apiHost;
    this._instance.data = data;
    this._instance.headers = {
      "Content-Type": "application/json; charset=utf-8",
    };
    this._instance.timeout = 0.01;
    this._instance.withCredentials = false;
    this._instance.token = null;
  }

  static get = (url: string) => new APIBuilder("GET", url);
  static put = (url: string, data: unknown) => new APIBuilder("PUT", url, data);
  static patch = (url: string, data: unknown) =>
    new APIBuilder("PATCH", url, data);
  static post = (url: string, data: unknown) =>
    new APIBuilder("POST", url, data);
  static delete = (url: string, data: unknown) => {
    if (data) {
      return new APIBuilder("DELETE", url, data);
    } else {
      return new APIBuilder("DELETE", url);
    }
  };

  baseURL(value: string): APIBuilder {
    this._instance.baseURL = value;
    return this;
  }

  headers(value: HTTPHeaders): APIBuilder {
    this._instance.headers = { ...this._instance.headers, ...value };
    return this;
  }

  setToken() {
    const token = cache.get("token");
    if (token) {
      this._instance.token = token;
    } else {
      this._instance.token = null;
    }
    return this;
  }

  setTokenInHeader() {
    if (!this._instance.token) return this;
    this._instance.headers = {
      ...this._instance.headers,
      Authorization: `Bearer ${this._instance.token}`,
    };
    return this;
  }

  setAuth() {
    return this.setToken().setTokenInHeader();
  }

  timeout(value: number): APIBuilder {
    this._instance.timeout = value;
    return this;
  }

  params(value: HTTPParams): APIBuilder {
    this._instance.params = value;
    return this;
  }

  data(value: unknown): APIBuilder {
    this._instance.data = value;
    return this;
  }

  withCredentials(value: boolean): APIBuilder {
    this._instance.withCredentials = value;
    return this;
  }

  build(): API {
    return this._instance;
  }
}

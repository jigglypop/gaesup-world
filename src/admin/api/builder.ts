import { adminToken } from './token';

interface APIResponse<T> {
  data: T;
  headers: { [key: string]: string };
  status: number;
}

type JsonPrimitive = string | number | boolean | null;
type RequestBody = JsonPrimitive | object;

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`Admin API request failed with status ${status}`);
    this.name = 'AdminApiError';
  }
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

class APIBuilder {
  private method: string = 'GET';
  private url: string = '';
  private baseUrl: string = '';
  private body: RequestBody | null = null;
  private headers: { [key: string]: string } = {};
  private withAuth: boolean = false;

  static get(url: string) {
    const builder = new APIBuilder();
    builder.method = 'GET';
    builder.url = url;
    return builder;
  }

  static post(url: string, body?: RequestBody) {
    const builder = new APIBuilder();
    builder.method = 'POST';
    builder.url = url;
    builder.body = body ?? null;
    return builder;
  }

  static patch(url: string, body?: RequestBody) {
    const builder = new APIBuilder();
    builder.method = 'PATCH';
    builder.url = url;
    builder.body = body ?? null;
    return builder;
  }

  static delete(url: string, body?: RequestBody) {
    const builder = new APIBuilder();
    builder.method = 'DELETE';
    builder.url = url;
    builder.body = body ?? null;
    return builder;
  }

  baseURL(url: string) {
    this.baseUrl = url;
    return this;
  }

  setAuth() {
    this.withAuth = true;
    return this;
  }

  build() {
    return {
      call: async <T>(): Promise<APIResponse<T>> => {
        const fullUrl = `${this.baseUrl}${this.url}`;
        const headers: { [key: string]: string } = {
          'Content-Type': 'application/json',
          ...this.headers,
        };

        if (this.withAuth) {
          const token = adminToken.get();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }

        const options: RequestInit = {
          method: this.method,
          headers,
          credentials: 'include',
        };

        if (this.body !== null && this.method !== 'GET') {
          options.body = typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
        }

        const response = await fetch(fullUrl, options);
        const data = await readBody(response);
        if (!response.ok) throw new AdminApiError(response.status, data);

        const responseHeaders: { [key: string]: string } = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        return {
          data: data as T,
          headers: responseHeaders,
          status: response.status,
        };
      },
    };
  }
}

export default APIBuilder;

import cache from "../utils/cache";

interface APIResponse<T> {
  data: T;
  headers: { [key: string]: string };
  status: number;
}

class APIBuilder {
  private method: string = 'GET';
  private url: string = '';
  private baseUrl: string = '';
  private body: any = null;
  private headers: { [key: string]: string } = {};
  private withAuth: boolean = false;

  static get(url: string) {
    const builder = new APIBuilder();
    builder.method = 'GET';
    builder.url = url;
    return builder;
  }

  static post(url: string, body?: any) {
    const builder = new APIBuilder();
    builder.method = 'POST';
    builder.url = url;
    builder.body = body;
    return builder;
  }

  static patch(url: string, body?: any) {
    const builder = new APIBuilder();
    builder.method = 'PATCH';
    builder.url = url;
    builder.body = body;
    return builder;
  }

  static delete(url: string, body?: any) {
    const builder = new APIBuilder();
    builder.method = 'DELETE';
    builder.url = url;
    builder.body = body;
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
          const token = cache.get('token');
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }

        const options: RequestInit = {
          method: this.method,
          headers,
        };

        if (this.body && this.method !== 'GET') {
          options.body = typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
        }

        const response = await fetch(fullUrl, options);
        const data = await response.json();

        const responseHeaders: { [key: string]: string } = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        return {
          data,
          headers: responseHeaders,
          status: response.status,
        };
      },
    };
  }
}

export default APIBuilder; 
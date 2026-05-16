interface APIResponse<T> {
    data: T;
    headers: {
        [key: string]: string;
    };
    status: number;
}
type JsonPrimitive = string | number | boolean | null;
type RequestBody = JsonPrimitive | object;
declare class APIBuilder {
    private method;
    private url;
    private baseUrl;
    private body;
    private headers;
    private withAuth;
    static get(url: string): APIBuilder;
    static post(url: string, body?: RequestBody): APIBuilder;
    static patch(url: string, body?: RequestBody): APIBuilder;
    static delete(url: string, body?: RequestBody): APIBuilder;
    baseURL(url: string): this;
    setAuth(): this;
    build(): {
        call: <T>() => Promise<APIResponse<T>>;
    };
}
export default APIBuilder;

export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare const Result: {
    ok<T>(value: T): Result<T>;
    err<E = Error>(error: E): Result<never, E>;
    wrap<T>(fn: () => T): Result<T>;
    wrapAsync<T>(fn: () => Promise<T>): Promise<Result<T>>;
    map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U>;
    flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E>;
    unwrap<T>(result: Result<T>): T;
    unwrapOr<T>(result: Result<T>, defaultValue: T): T;
    isOk<T>(result: Result<T>): result is {
        ok: true;
        value: T;
    };
    isErr<T, E>(result: Result<T, E>): result is {
        ok: false;
        error: E;
    };
};

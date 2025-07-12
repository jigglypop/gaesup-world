export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Result = {
  ok<T>(value: T): Result<T> {
    return { ok: true, value };
  },

  err<E = Error>(error: E): Result<never, E> {
    return { ok: false, error };
  },

  wrap<T>(fn: () => T): Result<T> {
    try {
      return Result.ok(fn());
    } catch (error) {
      return Result.err(error as Error);
    }
  },

  async wrapAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
    try {
      const value = await fn();
      return Result.ok(value);
    } catch (error) {
      return Result.err(error as Error);
    }
  },

  map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U> {
    if (result.ok) {
      return Result.ok(fn(result.value));
    }
    return result;
  },

  flatMap<T, U, E>(
    result: Result<T, E>, 
    fn: (value: T) => Result<U, E>
  ): Result<U, E> {
    if (result.ok) {
      return fn(result.value);
    }
    return result;
  },

  unwrap<T>(result: Result<T>): T {
    if (result.ok) {
      return result.value;
    }
    throw result.error;
  },

  unwrapOr<T>(result: Result<T>, defaultValue: T): T {
    return result.ok ? result.value : defaultValue;
  },

  isOk<T>(result: Result<T>): result is { ok: true; value: T } {
    return result.ok;
  },

  isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
    return !result.ok;
  }
}; 
/**
 * Reads NODE_ENV as the consumer's bundler resolves it. The library build leaves the expression intact;
 * runtimes without a `process` global (unbundled ESM) read as undefined instead of throwing.
 */
export function readNodeEnv(): string | undefined {
  try {
    return process.env.NODE_ENV;
  } catch {
    return undefined;
  }
}

export function isProductionEnv(): boolean {
  return readNodeEnv() === 'production';
}

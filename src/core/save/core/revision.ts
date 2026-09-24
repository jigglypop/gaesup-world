/**
 * Revision for immutable state: advances whenever a value returned by `read` changes identity.
 * The values must be replaced, never mutated in place, when their content changes.
 */
export function createIdentityRevision(read: () => readonly unknown[]): () => number {
  let seen: readonly unknown[] = [];
  let revision = 0;
  return () => {
    const next = read();
    if (next.length !== seen.length || next.some((value, index) => !Object.is(value, seen[index]))) revision++;
    seen = next;
    return revision;
  };
}

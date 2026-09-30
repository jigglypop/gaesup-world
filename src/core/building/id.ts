import { createUniqueId } from '../utils/id';

export function createBuildingScopeId(prefix: string): string {
  return createUniqueId(prefix);
}

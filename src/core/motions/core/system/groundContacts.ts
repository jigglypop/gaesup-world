const groundContacts = new Map<string, boolean>();

export function reportGroundContact(entityId: string, grounded: boolean): void {
  groundContacts.set(entityId, grounded);
}

export function readGroundContact(entityId: string): boolean | undefined {
  return groundContacts.get(entityId);
}

export function clearGroundContact(entityId: string): void {
  groundContacts.delete(entityId);
}

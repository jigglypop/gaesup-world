/** A label that could show: its center on screen, its size in pixels and its distance from the camera. */
export type NameplateCandidate = { x: number; y: number; width: number; height: number; distance: number };

const overlaps = (a: NameplateCandidate, b: NameplateCandidate) =>
  Math.abs(a.x - b.x) * 2 < a.width + b.width && Math.abs(a.y - b.y) * 2 < a.height + b.height;

/** The labels to show: nearest first, at most `limit`, leaving out any whose box would cover one already shown. */
export function placeNameplates<T extends NameplateCandidate>(candidates: readonly T[], limit: number): T[] {
  const shown: T[] = [];
  for (const candidate of [...candidates].sort((a, b) => a.distance - b.distance)) {
    if (shown.length >= limit) break;
    if (!shown.some((other) => overlaps(candidate, other))) shown.push(candidate);
  }
  return shown;
}

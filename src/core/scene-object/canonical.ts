/** Scene data rejects `-0` (JSON turns it into `0`), so computed transform values pass through this first. */
export const canonicalZero = (value: number): number => (value === 0 ? 0 : value);

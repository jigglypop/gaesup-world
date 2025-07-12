export const ValidationUtils = {
  isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  },

  isPositiveNumber(value: unknown): value is number {
    return typeof value === 'number' && value > 0;
  },

  isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  },

  isValidId(id: unknown): id is string {
    return this.isNonEmptyString(id) && /^[a-zA-Z0-9_-]+$/.test(id);
  },

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  hasRequiredProperties<T extends Record<string, unknown>>(
    obj: unknown,
    requiredProps: (keyof T)[]
  ): obj is T {
    if (typeof obj !== 'object' || obj === null) return false;
    
    return requiredProps.every(prop => 
      Object.prototype.hasOwnProperty.call(obj, prop)
    );
  }
}; 
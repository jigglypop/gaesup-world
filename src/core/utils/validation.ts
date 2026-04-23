type ValidationValue = object | string | number | boolean | bigint | symbol | null | undefined;

export const ValidationUtils = {
  isNonEmptyString(value: ValidationValue): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  },

  isPositiveNumber(value: ValidationValue): value is number {
    return typeof value === 'number' && value > 0;
  },

  isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  },

  isValidId(id: ValidationValue): id is string {
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

  hasRequiredProperties<T extends Record<string, ValidationValue>>(
    obj: object | null | undefined,
    requiredProps: (keyof T)[]
  ): obj is T {
    if (typeof obj !== 'object' || obj === null) return false;
    
    return requiredProps.every(prop => 
      Object.prototype.hasOwnProperty.call(obj, prop)
    );
  }
}; 

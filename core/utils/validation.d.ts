type ValidationValue = object | string | number | boolean | bigint | symbol | null | undefined;
export declare const ValidationUtils: {
    isNonEmptyString(value: ValidationValue): value is string;
    isPositiveNumber(value: ValidationValue): value is number;
    isInRange(value: number, min: number, max: number): boolean;
    isValidId(id: ValidationValue): id is string;
    isValidEmail(email: string): boolean;
    isValidUrl(url: string): boolean;
    hasRequiredProperties<T extends Record<string, ValidationValue>>(obj: object | null | undefined, requiredProps: (keyof T)[]): obj is T;
};
export {};

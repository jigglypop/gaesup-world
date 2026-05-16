export type ConditionChecker<T> = (value: T) => boolean;
export declare class Conditions<T> {
    private value;
    private checks;
    constructor(value: T);
    static check<T>(value: T): Conditions<T>;
    and(condition: ConditionChecker<T>): this;
    or(condition: ConditionChecker<T>): Conditions<T>;
    evaluate(): boolean;
}
export declare const when: <T>(value: T) => {
    is: (condition: ConditionChecker<T>) => {
        then: <R>(result: R) => {
            else: (fallback: R) => R;
        };
    };
    matches: (cases: Array<[ConditionChecker<T>, () => void]>) => void;
};

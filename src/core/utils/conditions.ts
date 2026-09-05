export type ConditionChecker<T> = (value: T) => boolean;

export class Conditions<T> {
  private checks: ConditionChecker<T>[] = [];

  constructor(private value: T) {}

  static check<T>(value: T): Conditions<T> {
    return new Conditions(value);
  }

  and(condition: ConditionChecker<T>): this {
    this.checks.push(condition);
    return this;
  }

  or(condition: ConditionChecker<T>): Conditions<T> {
    const previousResult = this.evaluate();
    return new Conditions(this.value).and(
      (val) => previousResult || condition(val)
    );
  }

  evaluate(): boolean {
    return this.checks.every(check => check(this.value));
  }
}

export const when = <T>(value: T) => ({
  is: (condition: ConditionChecker<T>) => ({
    then: <R>(result: R) => ({
      else: (fallback: R): R => condition(value) ? result : fallback
    })
  }),
  
  matches: (cases: Array<[ConditionChecker<T>, () => void]>) => {
    const matchedCase = cases.find(([condition]) => condition(value));
    if (matchedCase) {
      matchedCase[1]();
    }
  }
}); 
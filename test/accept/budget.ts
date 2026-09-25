import budgets from './budgets.json';

export type Metrics = Record<string, number | boolean>;
export type Budget = Record<string, number | boolean | null>;
export type ScenarioStatus = 'green' | 'known-red' | 'pending';
export type ScenarioEntry = {
  title: string;
  runner: 'headless' | 'browser';
  item: string;
  status: ScenarioStatus;
  budget: Budget;
};
/** pass/fail judge a green scenario; a known-red one reads known-red until it fits its budget, then fixed. */
export type Verdict = 'pass' | 'fail' | 'known-red' | 'fixed' | 'pending';

/** Acceptance scenarios of prd/01-verification.md; shared by the jest runner, `pnpm accept` and the /accept page. */
export const scenarios = budgets.scenarios as Readonly<Record<string, ScenarioEntry>>;

export type BudgetCheck = { name: string; limit: number | boolean | null; value: number | boolean | undefined; pass: boolean };

/** One line per budget entry: numbers are upper bounds, booleans must match, null is only recorded (always passes). */
export function checkBudget(metrics: Readonly<Metrics>, budget: Readonly<Budget>): BudgetCheck[] {
  return Object.entries(budget).map(([name, limit]) => {
    const value = metrics[name];
    const pass = limit === null
      || (value !== undefined && (typeof limit === 'boolean' ? value === limit : typeof value === 'number' && value <= limit));
    return { name, limit, value, pass };
  });
}

export function violations(metrics: Readonly<Metrics>, budget: Readonly<Budget>): string[] {
  return checkBudget(metrics, budget).filter((check) => !check.pass).map(({ name, limit, value }) => (
    value === undefined ? `${name}: not measured` : `${name}: ${String(value)} (budget ${String(limit)})`
  ));
}

export function verdict(status: ScenarioStatus, over: readonly string[]): Verdict {
  if (status === 'pending') return 'pending';
  if (status === 'known-red') return over.length === 0 ? 'fixed' : 'known-red';
  return over.length === 0 ? 'pass' : 'fail';
}

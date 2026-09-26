import budgets from './budgets.json';

export type Metrics = Record<string, number | boolean>;
/** Inclusive bounds; either end may stay open. `{ "min": 1, "max": 1 }` demands exactly 1. */
export type BudgetRange = { min?: number; max?: number };
/** A number is an upper bound, a boolean must match, a range bounds both ends, null is only recorded. */
export type BudgetLimit = number | boolean | BudgetRange | null;
export type Budget = Record<string, BudgetLimit>;
export type ScenarioStatus = 'green' | 'known-red' | 'pending';
export type ScenarioEntry = {
  title: string;
  runner: 'headless';
  item: string;
  status: ScenarioStatus;
  budget: Budget;
};
/** pass/fail judge a green scenario; a known-red one reads known-red until it fits its budget, then fixed. */
export type Verdict = 'pass' | 'fail' | 'known-red' | 'fixed' | 'pending';

/** Acceptance scenarios, their status and budgets, judged by the jest `accept` project. */
export const scenarios = budgets.scenarios as Readonly<Record<string, ScenarioEntry>>;

export type BudgetCheck = { name: string; limit: BudgetLimit; value: number | boolean | undefined; pass: boolean };

function within(value: number | boolean, limit: Exclude<BudgetLimit, null>): boolean {
  if (typeof limit === 'boolean') return value === limit;
  if (typeof value !== 'number') return false;
  if (typeof limit === 'number') return value <= limit;
  return (limit.min === undefined || value >= limit.min) && (limit.max === undefined || value <= limit.max);
}

/** One line per budget entry. A non-finite number (an empty `Math.max()`, 0/0) is a broken measurement, not a value. */
export function checkBudget(metrics: Readonly<Metrics>, budget: Readonly<Budget>): BudgetCheck[] {
  return Object.entries(budget).map(([name, limit]) => {
    const raw = metrics[name];
    const value = typeof raw === 'number' && !Number.isFinite(raw) ? undefined : raw;
    return { name, limit, value, pass: limit === null || (value !== undefined && within(value, limit)) };
  });
}

function formatLimit(limit: BudgetLimit): string {
  if (limit === null) return '기록';
  if (typeof limit === 'boolean') return String(limit);
  if (typeof limit === 'number') return `≤ ${limit}`;
  const { min, max } = limit;
  if (min !== undefined && max !== undefined) return min === max ? `= ${min}` : `${min}~${max}`;
  return min !== undefined ? `≥ ${min}` : `≤ ${max}`;
}

export function violations(metrics: Readonly<Metrics>, budget: Readonly<Budget>): string[] {
  return checkBudget(metrics, budget).filter((check) => !check.pass).map(({ name, limit, value }) => (
    value === undefined ? `${name}: not measured` : `${name}: ${String(value)} (budget ${formatLimit(limit)})`
  ));
}

export function verdict(status: ScenarioStatus, over: readonly string[]): Verdict {
  if (status === 'pending') return 'pending';
  if (status === 'known-red') return over.length === 0 ? 'fixed' : 'known-red';
  return over.length === 0 ? 'pass' : 'fail';
}

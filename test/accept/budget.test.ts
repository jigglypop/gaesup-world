import { checkBudget, formatLimit, verdict, violations } from './budget';

test('a range bounds both ends and a single number only the top', () => {
  const budget = { exact: { min: 1, max: 1 }, floor: { min: 0.5 }, cap: 2 };
  expect(violations({ exact: 1, floor: 1, cap: 2 }, budget)).toEqual([]);
  expect(violations({ exact: 0, floor: 0, cap: 0 }, budget)).toEqual([
    'exact: 0 (budget = 1)',
    'floor: 0 (budget ≥ 0.5)',
  ]);
  expect(violations({ exact: 2, floor: 3, cap: 3 }, budget)).toEqual(['exact: 2 (budget = 1)', 'cap: 3 (budget ≤ 2)']);
});

test('a non-finite or missing value is not measured, so it never passes as a small number', () => {
  const budget = { bytes: 120, rate: { min: 0.5, max: 2 }, flag: true, note: null };
  expect(violations({ bytes: -Infinity, rate: Number.NaN, note: 3 }, budget)).toEqual([
    'bytes: not measured',
    'rate: not measured',
    'flag: not measured',
  ]);
  expect(checkBudget({}, { note: null })).toEqual([{ name: 'note', limit: null, value: undefined, pass: true }]);
});

test('status decides what a clean or over-budget measurement means', () => {
  expect(verdict('green', [])).toBe('pass');
  expect(verdict('green', ['x'])).toBe('fail');
  expect(verdict('known-red', ['x'])).toBe('known-red');
  expect(verdict('known-red', [])).toBe('fixed');
  expect(verdict('pending', ['x'])).toBe('pending');
});

test('limits print the way the board shows them', () => {
  expect([null, true, 16, { min: 1, max: 1 }, { min: 1, max: 3 }, { min: 0.5 }, { max: 4 }].map(formatLimit))
    .toEqual(['기록', 'true', '≤ 16', '= 1', '1~3', '≥ 0.5', '≤ 4']);
});
